import sequelize from '../config/db.js';
import { Order, OrderItem, Payment, Product, ProductVariant, User } from '../models/index.js';
import AppError from '../utils/AppError.js';

export const getOrders = async (req, res, next) => {
  try {
    const { status, orderId, userId, page = 1, limit = 20 } = req.query;

    const where = req.user.role === 'admin' ? {} : { userId: req.user.id };
    if (status) where.status = status;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (orderId) {
      if (!uuidRegex.test(orderId)) return res.json({ total: 0, page: Number(page), totalPages: 0, data: [] });
      where.id = orderId;
    }
    if (userId && req.user.role === 'admin') {
      if (!uuidRegex.test(userId)) return res.json({ total: 0, page: Number(page), totalPages: 0, data: [] });
      where.userId = userId;
    }

    const offset = (Number(page) - 1) * Number(limit);

    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [OrderItem],
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

export const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [OrderItem, Payment, { model: User, attributes: ['id', 'name', 'email'] }],
    });
    if (!order) throw new AppError('Order not found', 404);
    if (req.user.role !== 'admin' && order.userId !== req.user.id) {
      throw new AppError('You do not have permission to perform this action', 403);
    }
    res.json(order);
  } catch (err) {
    next(err);
  }
};

export const createOrder = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { shippingAddress, note, shippingFee, discountAmount, items } = req.body;
    const userId = req.user.id;

    // 鎖定 variant 並檢查庫存
    for (const item of items) {
      const variant = await ProductVariant.findByPk(item.variantId, { lock: true, transaction: t });
      if (!variant) throw new AppError(`Variant ${item.variantId} not found`, 404);
      if (variant.stock < item.quantity) {
        throw new AppError(`Variant ${item.variantId} 庫存不足（剩餘: ${variant.stock}）`, 409);
      }
      await variant.decrement('stock', { by: item.quantity, transaction: t });
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
        variantId: item.variantId,
        productName: item.productName,
        variantName: item.variantName,
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

    // 取消訂單時補回 variant 庫存
    if (status === 'cancelled' && order.status !== 'cancelled') {
      const orderItems = await OrderItem.findAll({ where: { orderId: order.id }, transaction: t });
      for (const item of orderItems) {
        if (item.variantId) {
          await ProductVariant.increment('stock', {
            by: item.quantity,
            where: { id: item.variantId },
            transaction: t,
          });
        }
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
