import { Op } from 'sequelize';
import { User } from '../models/index.js';
import AppError from '../utils/AppError.js';

export const getUsers = async (req, res, next) => {
  try {
    const { q } = req.query;
    const where = q
      ? { [Op.or]: [{ name: { [Op.like]: `%${q}%` } }, { email: { [Op.like]: `%${q}%` } }] }
      : {};

    const users = await User.findAll({
      where,
      attributes: { exclude: ['password'] },
      order: [['id', 'ASC']],
    });
    res.json(users);
  } catch (err) {
    next(err);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
    });
    if (!user) throw new AppError('User not found', 404);
    res.json(user);
  } catch (err) {
    next(err);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) throw new AppError('User not found', 404);
    const { name, phone } = req.body;
    await user.update({ name, phone });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) throw new AppError('User not found', 404);
    await user.destroy();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
