import { Op } from 'sequelize';
import { ProductImage } from '../models/index.js';
import AppError from '../utils/AppError.js';
import { parseMedia, uploadToGCS } from '../utils/upload.js';

export const getImages = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, search } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const where = search ? { filename: { [Op.iLike]: `%${search}%` } } : {};
    const { count, rows } = await ProductImage.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
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

export const uploadImage = async (req, res, next) => {
  try {
    await parseMedia(req, res);
    if (!req.file) throw new AppError('No file uploaded', 400);
    const url = await uploadToGCS(req.file);
    const image = await ProductImage.create({
      url,
      filename: req.file.originalname,
      size: req.file.size,
    });
    res.status(201).json(image);
  } catch (err) {
    next(err);
  }
};

export const updateImage = async (req, res, next) => {
  try {
    const image = await ProductImage.findByPk(req.params.imageId);
    if (!image) throw new AppError('Image not found', 404);
    const { filename } = req.body;
    await image.update({ filename });
    res.json(image);
  } catch (err) {
    next(err);
  }
};

export const deleteImage = async (req, res, next) => {
  try {
    const image = await ProductImage.findByPk(req.params.imageId);
    if (!image) throw new AppError('Image not found', 404);
    await image.destroy();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
