import { Review } from '../models/index.js';
import AppError from '../utils/AppError.js';

export const getReviews = async (req, res, next) => {
  try {
    const reviews = await Review.findAll({ where: { productId: req.params.productId } });
    res.json(reviews);
  } catch (err) {
    next(err);
  }
};

export const createReview = async (req, res, next) => {
  try {
    const { orderItemId, rating, comment } = req.body;
    const review = await Review.create({
      productId: req.params.productId,
      userId: req.user.id,
      orderItemId, rating, comment,
    });
    res.status(201).json(review);
  } catch (err) {
    next(err);
  }
};

export const updateReview = async (req, res, next) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) throw new AppError('Review not found', 404);
    if (review.userId !== req.user.id) throw new AppError('You do not have permission to perform this action', 403);
    const { rating, comment } = req.body;
    await review.update({ rating, comment });
    res.json(review);
  } catch (err) {
    next(err);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) throw new AppError('Review not found', 404);
    if (review.userId !== req.user.id) throw new AppError('You do not have permission to perform this action', 403);
    await review.destroy();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
