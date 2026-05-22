import { Review } from '../models/index.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';

export const getReviews = catchAsync(async (req, res) => {
  const reviews = await Review.findAll({ where: { productId: req.params.productId } });
  res.json(reviews);
});

export const createReview = catchAsync(async (req, res) => {
  const { userId, orderItemId, rating, comment } = req.body;
  const review = await Review.create({
    productId: req.params.productId,
    userId, orderItemId, rating, comment,
  });
  res.status(201).json(review);
});

export const updateReview = catchAsync(async (req, res) => {
  const review = await Review.findByPk(req.params.id);
  if (!review) throw new AppError('Review not found', 404);
  const { rating, comment } = req.body;
  await review.update({ rating, comment });
  res.json(review);
});

export const deleteReview = catchAsync(async (req, res) => {
  const review = await Review.findByPk(req.params.id);
  if (!review) throw new AppError('Review not found', 404);
  await review.destroy();
  res.status(204).send();
});
