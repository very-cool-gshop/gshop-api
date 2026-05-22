import { ProductImage } from '../models/index.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';

export const addImage = catchAsync(async (req, res) => {
  const { url, sortOrder } = req.body;
  const image = await ProductImage.create({
    productId: req.params.productId,
    url, sortOrder,
  });
  res.status(201).json(image);
});

export const deleteImage = catchAsync(async (req, res) => {
  const image = await ProductImage.findOne({
    where: { id: req.params.imageId, productId: req.params.productId },
  });
  if (!image) throw new AppError('Image not found', 404);
  await image.destroy();
  res.status(204).send();
});
