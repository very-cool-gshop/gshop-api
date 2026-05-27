import { Category } from '../models/index.js';
import AppError from '../utils/AppError.js';

export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.findAll({
      order: [['sortOrder', 'ASC'], ['id', 'ASC']],
    });
    res.json(categories);
  } catch (err) {
    next(err);
  }
};

export const getCategory = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) throw new AppError('Category not found', 404);
    res.json(category);
  } catch (err) {
    next(err);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const { name, sortOrder } = req.body;
    const category = await Category.create({ name, sortOrder });
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) throw new AppError('Category not found', 404);
    const { name, sortOrder } = req.body;
    await category.update({ name, sortOrder });
    res.json(category);
  } catch (err) {
    next(err);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) throw new AppError('Category not found', 404);
    await category.destroy();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
