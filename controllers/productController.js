import { Product, ProductVariant, ProductImage, Review } from '../models/index.js';
import AppError from '../utils/AppError.js';

export const getProducts = async (req, res, next) => {
  try {
    const products = await Product.findAll({
      include: [ProductVariant, ProductImage],
    });
    res.json(products);
  } catch (err) {
    next(err);
  }
};

export const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [ProductVariant, ProductImage, Review],
    });
    if (!product) throw new AppError('Product not found', 404);
    res.json(product);
  } catch (err) {
    next(err);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const { categoryId, name, slug, description, status } = req.body;
    const product = await Product.create({ categoryId, name, slug, description, status });
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) throw new AppError('Product not found', 404);
    const { categoryId, name, slug, description, status } = req.body;
    await product.update({ categoryId, name, slug, description, status });
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
