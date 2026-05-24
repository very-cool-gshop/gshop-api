import sequelize from '../config/db.js';
import { Order, OrderItem, Payment, Product } from '../models/index.js';
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
  const t = await sequelize.transaction();
  try {
    const { userId, shippingAddress, note, shippingFee, discountAmount, items } = req.body;

    // 鎖定商品並檢查庫存
    for (const item of items) {
      const product = await Product.findByPk(item.productId, { lock: true, transaction: t });
      if (!product) throw new AppError(`Product ${item.productId} not found`, 404);
      if (product.stock < item.quantity) {
        throw new AppError(`Insufficient stock for "${product.name}" (available: ${product.stock})`, 409);
      }
      await product.decrement('stock', { by: item.quantity, transaction: t });
    }

    const totalAmount = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

    const order = await Order.create({
      userId, shippingAddress, note,
      shippingFee: shippingFee || 0,
      discountAmount: discountAmount || 0,
      totalAmount,
    }, { transaction: t });

    await OrderItem.bulkCreate(
      items.map((item) => ({
        orderId: order.id,
        productId: item.productId,
        productName: item.productName,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        subtotal: item.unitPrice * item.quantity,
      })),
      { transaction: t },
    );

    await t.commit();

    const result = await Order.findByPk(order.id, { include: [OrderItem] });
    res.status(201).json(result);
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const order = await Order.findByPk(req.params.id, { transaction: t });
    if (!order) throw new AppError('Order not found', 404);

    const { status } = req.body;

    // 取消訂單時補回庫存
    if (status === 'cancelled' && order.status !== 'cancelled') {
      const orderItems = await OrderItem.findAll({ where: { orderId: order.id }, transaction: t });
      for (const item of orderItems) {
        await Product.increment('stock', {
          by: item.quantity,
          where: { id: item.productId },
          transaction: t,
        });
      }
    }

    await order.update({ status }, { transaction: t });
    await t.commit();
    res.json(order);
  } catch (err) {
    await t.rollback();
    next(err);
  }
};
