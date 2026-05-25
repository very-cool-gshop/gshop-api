import sequelize from '../config/db.js';
import { Cart, CartItem, ProductVariant, OptionValue, Product, Order, OrderItem } from '../models/index.js';
import AppError from '../utils/AppError.js';

const variantInclude = {
  model: ProductVariant,
  include: [
    { model: Product, attributes: ['id', 'name', 'imageUrl'] },
    { model: OptionValue, through: { attributes: [] } },
  ],
};

export const getCart = async (req, res, next) => {
  try {
    const [cart] = await Cart.findOrCreate({ where: { userId: req.params.userId } });
    const cartWithItems = await Cart.findByPk(cart.id, {
      include: [{ model: CartItem, include: [variantInclude] }],
    });
    res.json(cartWithItems);
  } catch (err) {
    next(err);
  }
};

export const addCartItem = async (req, res, next) => {
  try {
    const [cart] = await Cart.findOrCreate({ where: { userId: req.params.userId } });
    const { variantId, quantity } = req.body;

    const variant = await ProductVariant.findByPk(variantId);
    if (!variant) throw new AppError('Variant not found', 404);

    const [item, created] = await CartItem.findOrCreate({
      where: { cartId: cart.id, variantId },
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

export const checkout = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const userId = req.user.id;
    const { shippingAddress, note, shippingFee, discountAmount } = req.body;

    const cart = await Cart.findOne({
      where: { userId },
      include: [{ model: CartItem, include: [variantInclude] }],
      transaction: t,
    });

    if (!cart || cart.CartItems.length === 0) {
      throw new AppError('Cart is empty', 400);
    }

    // 鎖定 variant 並檢查庫存
    for (const item of cart.CartItems) {
      const variant = await ProductVariant.findByPk(item.variantId, { lock: true, transaction: t });
      if (variant.stock < item.quantity) {
        const name = item.ProductVariant.Product.name;
        throw new AppError(`"${name}" 庫存不足（剩餘: ${variant.stock}）`, 409);
      }
      await variant.decrement('stock', { by: item.quantity, transaction: t });
    }

    const totalAmount = cart.CartItems.reduce(
      (sum, item) => sum + Number(item.ProductVariant.price) * item.quantity,
      0,
    );

    const order = await Order.create({
      userId,
      shippingAddress,
      note,
      shippingFee: shippingFee || 0,
      discountAmount: discountAmount || 0,
      totalAmount,
    }, { transaction: t });

    await OrderItem.bulkCreate(
      cart.CartItems.map((item) => {
        const variant = item.ProductVariant;
        const variantName = variant.OptionValues?.map((v) => v.value).join(' / ') || '';
        return {
          orderId: order.id,
          productId: variant.productId,
          variantId: variant.id,
          productName: variant.Product.name,
          variantName,
          unitPrice: variant.price,
          quantity: item.quantity,
          subtotal: Number(variant.price) * item.quantity,
        };
      }),
      { transaction: t },
    );

    await CartItem.destroy({ where: { cartId: cart.id }, transaction: t });

    await t.commit();

    const result = await Order.findByPk(order.id, { include: [OrderItem] });
    res.status(201).json(result);
  } catch (err) {
    await t.rollback();
    next(err);
  }
};
