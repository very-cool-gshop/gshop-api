import { Op } from 'sequelize';
import { Product, ProductVariant, ProductImage, ProductImageMap, VariantImageMap, Review } from '../models/index.js';
import AppError from '../utils/AppError.js';

// ── Products ──────────────────────────────────────────────

export const getProducts = async (req, res, next) => {
  try {
    const {
      search,
      status,
      categoryId,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      order = 'DESC',
      page = 1,
      limit = 20,
    } = req.query;

    const where = {};
    if (status) where.status = status;
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
      include: [
        Review,
        {
          model: ProductVariant,
          include: [{ model: ProductImage, as: 'images', through: { attributes: ['sortOrder'] } }],
        },
        { model: ProductImage, as: 'images', through: { attributes: ['sortOrder'] } },
      ],
    });
    if (!product) throw new AppError('Product not found', 404);
    res.json(product);
  } catch (err) {
    next(err);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const { categoryId, name, description, price, status, imageIds = [] } = req.body;
    const product = await Product.create({ categoryId, name, description, price, status });
    if (imageIds.length) {
      await ProductImageMap.bulkCreate(
        imageIds.map((imageId, i) => ({ productId: product.id, imageId, sortOrder: i }))
      );
    }
    const result = await Product.findByPk(product.id, {
      include: [{ model: ProductImage, as: 'images', through: { attributes: ['sortOrder'] } }],
    });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) throw new AppError('Product not found', 404);
    const { categoryId, name, description, price, status, imageIds } = req.body;
    await product.update({ categoryId, name, description, price, status });
    if (imageIds) {
      await ProductImageMap.destroy({ where: { productId: product.id } });
      if (imageIds.length) {
        await ProductImageMap.bulkCreate(
          imageIds.map((imageId, i) => ({ productId: product.id, imageId, sortOrder: i }))
        );
      }
    }
    const result = await Product.findByPk(product.id, {
      include: [{ model: ProductImage, as: 'images', through: { attributes: ['sortOrder'] } }],
    });
    res.json(result);
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

// ── Variants ──────────────────────────────────────────────

export const createVariant = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) throw new AppError('Product not found', 404);
    const { price, stock, name, imageIds = [] } = req.body;
    const variant = await ProductVariant.create({ productId: product.id, price, stock, name });
    if (imageIds.length) {
      await VariantImageMap.bulkCreate(
        imageIds.map((imageId, i) => ({ variantId: variant.id, imageId, sortOrder: i }))
      );
    }
    const result = await ProductVariant.findByPk(variant.id, {
      include: [{ model: ProductImage, as: 'images', through: { attributes: ['sortOrder'] } }],
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
    const { price, stock, name, imageIds } = req.body;
    await variant.update({ price, stock, name });
    if (imageIds) {
      await VariantImageMap.destroy({ where: { variantId: variant.id } });
      if (imageIds.length) {
        await VariantImageMap.bulkCreate(
          imageIds.map((imageId, i) => ({ variantId: variant.id, imageId, sortOrder: i }))
        );
      }
    }
    const result = await ProductVariant.findByPk(variant.id, {
      include: [{ model: ProductImage, as: 'images', through: { attributes: ['sortOrder'] } }],
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
