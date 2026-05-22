import { Payment, Order } from '../models/index.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';

export const getPayment = catchAsync(async (req, res) => {
  const payment = await Payment.findOne({ where: { orderId: req.params.orderId } });
  if (!payment) throw new AppError('Payment not found', 404);
  res.json(payment);
});

export const createPayment = catchAsync(async (req, res) => {
  const order = await Order.findByPk(req.params.orderId);
  if (!order) throw new AppError('Order not found', 404);

  const existing = await Payment.findOne({ where: { orderId: order.id } });
  if (existing) throw new AppError('Payment already exists for this order', 409);

  const { method, transactionId } = req.body;
  const payment = await Payment.create({
    orderId: order.id,
    method,
    amount: order.totalAmount,
    transactionId,
  });
  res.status(201).json(payment);
});
