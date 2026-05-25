import { Op } from 'sequelize';
import { Product, Review } from '../models/index.js';
import AppError from '../utils/AppError.js';
import { parseImage, uploadToGCS } from '../utils/upload.js';

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
      include: [Review],
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
    const { categoryId, name, description, price, stock, status } = req.body;
    const imageUrl = req.file ? await uploadToGCS(req.file) : undefined;
    const product = await Product.create({ categoryId, name, description, price, stock, imageUrl, status });
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
    const { categoryId, name, description, price, stock, status } = req.body;
    const imageUrl = req.file ? await uploadToGCS(req.file) : undefined;
    await product.update({ categoryId, name, description, price, stock, imageUrl, status });
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
