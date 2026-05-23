import { Order, OrderItem, Payment } from '../models/index.js';
import AppError from '../utils/AppError.js';

export const getOrders = async (req, res, next) => {
  try {
    const where = req.query.userId ? { userId: req.query.userId } : {};
    const orders = await Order.findAll({ where, include: [OrderItem] });
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

export const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [OrderItem, Payment],
    });
    if (!order) throw new AppError('Order not found', 404);
    res.json(order);
  } catch (err) {
    next(err);
  }
};

export const createOrder = async (req, res, next) => {
  try {
    const { userId, shippingAddress, note, shippingFee, discountAmount, items } = req.body;

    const totalAmount = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

    const order = await Order.create({
      userId, shippingAddress, note,
      shippingFee: shippingFee || 0,
      discountAmount: discountAmount || 0,
      totalAmount,
    });

    await OrderItem.bulkCreate(
      items.map((item) => ({
        orderId: order.id,
        productVariantId: item.productVariantId,
        productName: item.productName,
        variantName: item.variantName,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        subtotal: item.unitPrice * item.quantity,
      })),
    );

    const result = await Order.findByPk(order.id, { include: [OrderItem] });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) throw new AppError('Order not found', 404);
    await order.update({ status: req.body.status });
    res.json(order);
  } catch (err) {
    next(err);
  }
};
