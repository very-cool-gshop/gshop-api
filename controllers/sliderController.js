import { Op } from 'sequelize';
import { Slider, Product } from '../models/index.js';
import AppError from '../utils/AppError.js';

// 前台：只回傳啟用且在有效期間內的 slider
export const getSliders = async (req, res, next) => {
  try {
    const now = new Date();
    const sliders = await Slider.findAll({
      where: {
        isActive: true,
        [Op.and]: [
          { [Op.or]: [{ startAt: null }, { startAt: { [Op.lte]: now } }] },
          { [Op.or]: [{ endAt: null }, { endAt: { [Op.gte]: now } }] },
        ],
      },
      include: [{ model: Product, attributes: ['id', 'name', 'price', 'imageUrl'] }],
      order: [['sortOrder', 'ASC']],
    });
    res.json(sliders);
  } catch (err) {
    next(err);
  }
};

// 後台：回傳全部
export const adminGetSliders = async (req, res, next) => {
  try {
    const sliders = await Slider.findAll({
      include: [{ model: Product, attributes: ['id', 'name', 'price', 'imageUrl'] }],
      order: [['sortOrder', 'ASC']],
    });
    res.json(sliders);
  } catch (err) {
    next(err);
  }
};

export const createSlider = async (req, res, next) => {
  try {
    const { title, subtitle, imageUrl, productId, sortOrder, isActive, startAt, endAt } = req.body;
    const slider = await Slider.create({ title, subtitle, imageUrl, productId, sortOrder, isActive, startAt, endAt });
    res.status(201).json(slider);
  } catch (err) {
    next(err);
  }
};

export const updateSlider = async (req, res, next) => {
  try {
    const slider = await Slider.findByPk(req.params.id);
    if (!slider) throw new AppError('Slider not found', 404);
    const { title, subtitle, imageUrl, productId, sortOrder, isActive, startAt, endAt } = req.body;
    await slider.update({ title, subtitle, imageUrl, productId, sortOrder, isActive, startAt, endAt });
    res.json(slider);
  } catch (err) {
    next(err);
  }
};

export const deleteSlider = async (req, res, next) => {
  try {
    const slider = await Slider.findByPk(req.params.id);
    if (!slider) throw new AppError('Slider not found', 404);
    await slider.destroy();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
