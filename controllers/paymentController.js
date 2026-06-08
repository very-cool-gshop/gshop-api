import { Payment, Order } from '../models/index.js';
import AppError from '../utils/AppError.js';

export const getPayment = async (req, res, next) => {
  try {
    const payment = await Payment.findOne({ where: { orderId: req.params.orderId } });
    if (!payment) throw new AppError('Payment not found', 404);
    res.json(payment);
  } catch (err) {
    next(err);
  }
};

export const confirmPayment = async (req, res, next) => {
  try {
    const payment = await Payment.findOne({ where: { orderId: req.params.orderId } });
    if (!payment) throw new AppError('Payment not found', 404);
    if (payment.status === 'paid') throw new AppError('Payment already confirmed', 409);

    const { transactionId } = req.body;
    await payment.update({ status: 'paid', transactionId, paidAt: new Date() });

    const order = await Order.findByPk(req.params.orderId);
    await order.update({ status: 'paid' });

    res.json(payment);
  } catch (err) {
    next(err);
  }
};
