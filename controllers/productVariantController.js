import { ProductVariant } from '../models/index.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';

export const getVariants = catchAsync(async (req, res) => {
  const variants = await ProductVariant.findAll({
    where: { productId: req.params.productId },
  });
  res.json(variants);
});

export const createVariant = catchAsync(async (req, res) => {
  const { name, price, stock, imageUrl } = req.body;
  const variant = await ProductVariant.create({
    productId: req.params.productId,
    name, price, stock, imageUrl,
  });
  res.status(201).json(variant);
});

export const updateVariant = catchAsync(async (req, res) => {
  const variant = await ProductVariant.findOne({
    where: { id: req.params.variantId, productId: req.params.productId },
  });
  if (!variant) throw new AppError('Variant not found', 404);
  const { name, price, stock, imageUrl } = req.body;
  await variant.update({ name, price, stock, imageUrl });
  res.json(variant);
});

export const deleteVariant = catchAsync(async (req, res) => {
  const variant = await ProductVariant.findOne({
    where: { id: req.params.variantId, productId: req.params.productId },
  });
  if (!variant) throw new AppError('Variant not found', 404);
  await variant.destroy();
  res.status(204).send();
});
