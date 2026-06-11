import { randomUUID } from 'crypto';
import sequelize from '../config/db.js';
import { Order, OrderItem, Payment } from '../models/index.js';

const PAYMENT_METHODS = ['credit_card', 'bank_transfer', 'cod'];
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

export async function generateOrders() {
  const [users] = await sequelize.query(
    "SELECT id, name, phone, address FROM users WHERE role = 'customer' AND address IS NOT NULL"
  );
  const [variants] = await sequelize.query(
    `SELECT pv.id AS variant_id, pv.name AS variant_name, pv.price, p.id AS product_id, p.name AS product_name
     FROM product_variants pv
     JOIN products p ON p.id = pv.product_id
     WHERE p.status = 'active'`
  );
  if (!users.length || !variants.length) return;

  const now = new Date();
  const user = pick(users);
  const isCancelled = Math.random() < 0.1;
  const orderStatus = isCancelled ? 'cancelled' : 'delivered';
  const paymentStatus = isCancelled ? 'cancelled' : 'paid';

  const itemCount = randInt(1, 4);
  const shuffled = [...variants].sort(() => Math.random() - 0.5).slice(0, itemCount);
  const items = shuffled.map(v => {
    const qty = randInt(1, 3);
    return { variant: v, quantity: qty, subtotal: parseFloat(v.price) * qty };
  });
  const totalAmount = items.reduce((sum, it) => sum + it.subtotal, 0);

  const order = await Order.create({
    id: randomUUID(),
    userId: user.id,
    status: orderStatus,
    totalAmount,
    discountAmount: 0,
    address: user.address,
    recipientName: user.name,
    recipientPhone: user.phone,
    createdAt: now,
    updatedAt: now,
  });

  await OrderItem.bulkCreate(items.map(it => ({
    orderId: order.id,
    productId: it.variant.product_id,
    variantId: it.variant.variant_id,
    productName: it.variant.product_name,
    variantName: it.variant.variant_name,
    unitPrice: parseFloat(it.variant.price),
    quantity: it.quantity,
    subtotal: it.subtotal,
  })));

  await Payment.create({
    orderId: order.id,
    method: pick(PAYMENT_METHODS),
    status: paymentStatus,
    amount: totalAmount,
    transactionId: `TXN${Date.now()}${randInt(100, 999)}`,
    createdAt: now,
    updatedAt: now,
  });

  return `Created 1 ${orderStatus} order`;
}
