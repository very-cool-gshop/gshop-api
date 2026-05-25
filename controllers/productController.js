import { Op } from 'sequelize';
import { Product, ProductOption, OptionValue, ProductVariant, Review } from '../models/index.js';
import AppError from '../utils/AppError.js';
import { parseImage, uploadToGCS } from '../utils/upload.js';

const variantInclude = {
  model: ProductVariant,
  include: [{ model: OptionValue, through: { attributes: [] } }],
};

const optionInclude = {
  model: ProductOption,
  include: [OptionValue],
  order: [['sortOrder', 'ASC']],
};

// ── Products ──────────────────────────────────────────────

export const getProducts = async (req, res, next) => {
  try {
    const {
      search,
      categoryId,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      order = 'DESC',
      page = 1,
      limit = 20,
    } = req.query;

    const where = { status: 'active' };
    if (search) where.name = { [Op.iLike]: `%${search}%` };
    if (categoryId) where.categoryId = categoryId;
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = minPrice;
      if (maxPrice) where.price[Op.lte] = maxPrice;
    }

    const allowedSort = ['price', 'createdAt', 'name'];
    const sortColumn = allowedSort.includes(sortBy) ? sortBy : 'createdAt';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const offset = (Number(page) - 1) * Number(limit);

    const { count, rows } = await Product.findAndCountAll({
      where,
      order: [[sortColumn, sortOrder]],
      limit: Number(limit),
      offset,
    });

    res.json({
      total: count,
      page: Number(page),
      totalPages: Math.ceil(count / Number(limit)),
      data: rows,
    });
  } catch (err) {
    next(err);
  }
};

export const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [Review, optionInclude, variantInclude],
    });
    if (!product) throw new AppError('Product not found', 404);
    res.json(product);
  } catch (err) {
    next(err);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    await parseImage(req, res);
    const { categoryId, name, description, price, status } = req.body;
    const imageUrl = req.file ? await uploadToGCS(req.file) : undefined;
    const product = await Product.create({ categoryId, name, description, price, imageUrl, status });
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    await parseImage(req, res);
    const product = await Product.findByPk(req.params.id);
    if (!product) throw new AppError('Product not found', 404);
    const { categoryId, name, description, price, status } = req.body;
    const imageUrl = req.file ? await uploadToGCS(req.file) : undefined;
    await product.update({ categoryId, name, description, price, imageUrl, status });
    res.json(product);
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) throw new AppError('Product not found', 404);
    await product.destroy();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

// ── Options ───────────────────────────────────────────────

export const createOption = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) throw new AppError('Product not found', 404);
    const { name, sortOrder } = req.body;
    const option = await ProductOption.create({ productId: product.id, name, sortOrder });
    res.status(201).json(option);
  } catch (err) {
    next(err);
  }
};

export const updateOption = async (req, res, next) => {
  try {
    const option = await ProductOption.findByPk(req.params.optionId);
    if (!option) throw new AppError('Option not found', 404);
    const { name, sortOrder } = req.body;
    await option.update({ name, sortOrder });
    res.json(option);
  } catch (err) {
    next(err);
  }
};

export const deleteOption = async (req, res, next) => {
  try {
    const option = await ProductOption.findByPk(req.params.optionId);
    if (!option) throw new AppError('Option not found', 404);
    await option.destroy();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

// ── Option Values ─────────────────────────────────────────

export const createOptionValue = async (req, res, next) => {
  try {
    const option = await ProductOption.findByPk(req.params.optionId);
    if (!option) throw new AppError('Option not found', 404);
    const { value, sortOrder } = req.body;
    const optionValue = await OptionValue.create({ optionId: option.id, value, sortOrder });
    res.status(201).json(optionValue);
  } catch (err) {
    next(err);
  }
};

export const updateOptionValue = async (req, res, next) => {
  try {
    const optionValue = await OptionValue.findByPk(req.params.valueId);
    if (!optionValue) throw new AppError('Option value not found', 404);
    const { value, sortOrder } = req.body;
    await optionValue.update({ value, sortOrder });
    res.json(optionValue);
  } catch (err) {
    next(err);
  }
};

export const deleteOptionValue = async (req, res, next) => {
  try {
    const optionValue = await OptionValue.findByPk(req.params.valueId);
    if (!optionValue) throw new AppError('Option value not found', 404);
    await optionValue.destroy();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

// ── Variants ──────────────────────────────────────────────

export const createVariant = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) throw new AppError('Product not found', 404);
    const { sku, price, stock, imageUrl, optionValueIds } = req.body;
    const variant = await ProductVariant.create({ productId: product.id, sku, price, stock, imageUrl });
    if (optionValueIds?.length) await variant.setOptionValues(optionValueIds);
    const result = await ProductVariant.findByPk(variant.id, {
      include: [{ model: OptionValue, through: { attributes: [] } }],
    });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const updateVariant = async (req, res, next) => {
  try {
    const variant = await ProductVariant.findByPk(req.params.variantId);
    if (!variant) throw new AppError('Variant not found', 404);
    const { sku, price, stock, imageUrl, optionValueIds } = req.body;
    await variant.update({ sku, price, stock, imageUrl });
    if (optionValueIds) await variant.setOptionValues(optionValueIds);
    const result = await ProductVariant.findByPk(variant.id, {
      include: [{ model: OptionValue, through: { attributes: [] } }],
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const deleteVariant = async (req, res, next) => {
  try {
    const variant = await ProductVariant.findByPk(req.params.variantId);
    if (!variant) throw new AppError('Variant not found', 404);
    await variant.destroy();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
