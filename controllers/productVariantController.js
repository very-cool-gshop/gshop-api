import { ProductVariant } from '../models/index.js';
import AppError from '../utils/AppError.js';

export const getVariants = async (req, res, next) => {
  try {
    const variants = await ProductVariant.findAll({
      where: { productId: req.params.productId },
    });
    res.json(variants);
  } catch (err) {
    next(err);
  }
};

export const createVariant = async (req, res, next) => {
  try {
    const { name, price, stock, imageUrl } = req.body;
    const variant = await ProductVariant.create({
      productId: req.params.productId,
      name, price, stock, imageUrl,
    });
    res.status(201).json(variant);
  } catch (err) {
    next(err);
  }
};

export const updateVariant = async (req, res, next) => {
  try {
    const variant = await ProductVariant.findOne({
      where: { id: req.params.variantId, productId: req.params.productId },
    });
    if (!variant) throw new AppError('Variant not found', 404);
    const { name, price, stock, imageUrl } = req.body;
    await variant.update({ name, price, stock, imageUrl });
    res.json(variant);
  } catch (err) {
    next(err);
  }
};

export const deleteVariant = async (req, res, next) => {
  try {
    const variant = await ProductVariant.findOne({
      where: { id: req.params.variantId, productId: req.params.productId },
    });
    if (!variant) throw new AppError('Variant not found', 404);
    await variant.destroy();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
