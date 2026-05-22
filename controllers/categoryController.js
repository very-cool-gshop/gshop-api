import { Category } from '../models/index.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';

export const getCategories = catchAsync(async (req, res) => {
  const categories = await Category.findAll({
    where: { parentId: null },
    include: [{ model: Category, as: 'children' }],
    order: [['sortOrder', 'ASC']],
  });
  res.json(categories);
});

export const getCategory = catchAsync(async (req, res) => {
  const category = await Category.findByPk(req.params.id, {
    include: [{ model: Category, as: 'children' }],
  });
  if (!category) throw new AppError('Category not found', 404);
  res.json(category);
});

export const createCategory = catchAsync(async (req, res) => {
  const { parentId, name, slug, sortOrder } = req.body;
  const category = await Category.create({ parentId, name, slug, sortOrder });
  res.status(201).json(category);
});

export const updateCategory = catchAsync(async (req, res) => {
  const category = await Category.findByPk(req.params.id);
  if (!category) throw new AppError('Category not found', 404);
  const { parentId, name, slug, sortOrder } = req.body;
  await category.update({ parentId, name, slug, sortOrder });
  res.json(category);
});

export const deleteCategory = catchAsync(async (req, res) => {
  const category = await Category.findByPk(req.params.id);
  if (!category) throw new AppError('Category not found', 404);
  await category.destroy();
  res.status(204).send();
});
