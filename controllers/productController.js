import { Product, ProductVariant, ProductImage, Review } from '../models/index.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';

export const getProducts = catchAsync(async (req, res) => {
  const products = await Product.findAll({
    include: [ProductVariant, ProductImage],
  });
  res.json(products);
});

export const getProduct = catchAsync(async (req, res) => {
  const product = await Product.findByPk(req.params.id, {
    include: [ProductVariant, ProductImage, Review],
  });
  if (!product) throw new AppError('Product not found', 404);
  res.json(product);
});

export const createProduct = catchAsync(async (req, res) => {
  const { categoryId, name, slug, description, status } = req.body;
  const product = await Product.create({ categoryId, name, slug, description, status });
  res.status(201).json(product);
});

export const updateProduct = catchAsync(async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) throw new AppError('Product not found', 404);
  const { categoryId, name, slug, description, status } = req.body;
  await product.update({ categoryId, name, slug, description, status });
  res.json(product);
});

export const deleteProduct = catchAsync(async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) throw new AppError('Product not found', 404);
  await product.destroy();
  res.status(204).send();
});
