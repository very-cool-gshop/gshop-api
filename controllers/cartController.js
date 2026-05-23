import { Cart, CartItem, ProductVariant } from '../models/index.js';
import AppError from '../utils/AppError.js';

export const getCart = async (req, res, next) => {
  try {
    const [cart] = await Cart.findOrCreate({ where: { userId: req.params.userId } });
    const cartWithItems = await Cart.findByPk(cart.id, {
      include: [{ model: CartItem, include: [ProductVariant] }],
    });
    res.json(cartWithItems);
  } catch (err) {
    next(err);
  }
};

export const addCartItem = async (req, res, next) => {
  try {
    const [cart] = await Cart.findOrCreate({ where: { userId: req.params.userId } });
    const { productVariantId, quantity } = req.body;

    const [item, created] = await CartItem.findOrCreate({
      where: { cartId: cart.id, productVariantId },
      defaults: { quantity },
    });

    if (!created) await item.update({ quantity: item.quantity + quantity });

    res.status(created ? 201 : 200).json(item);
  } catch (err) {
    next(err);
  }
};

export const updateCartItem = async (req, res, next) => {
  try {
    const item = await CartItem.findByPk(req.params.itemId);
    if (!item) throw new AppError('Cart item not found', 404);
    await item.update({ quantity: req.body.quantity });
    res.json(item);
  } catch (err) {
    next(err);
  }
};

export const removeCartItem = async (req, res, next) => {
  try {
    const item = await CartItem.findByPk(req.params.itemId);
    if (!item) throw new AppError('Cart item not found', 404);
    await item.destroy();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
