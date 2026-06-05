import { randomUUID } from 'crypto';
import sequelize from '../config/db.js';
import '../models/index.js';
import Order from '../models/order.js';
import OrderItem from '../models/orderItem.js';
import Payment from '../models/payment.js';

const PAYMENT_METHODS = ['credit_card', 'bank_transfer', 'cod'];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function run() {
  await sequelize.authenticate();

  const [users] = await sequelize.query(
    "SELECT id, name, phone, address FROM users WHERE role = 'customer' AND address IS NOT NULL"
  );
  const [products] = await sequelize.query(
    "SELECT id, name, price FROM products WHERE status = 'active'"
  );

  if (!users.length || !products.length) {
    console.error('No users or products found');
    process.exit(1);
  }

  const count = randInt(3, 5);
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const user = pick(users);
    const itemCount = randInt(1, 4);
    const shuffled = [...products].sort(() => Math.random() - 0.5).slice(0, itemCount);

    const items = shuffled.map(p => {
      const qty = randInt(1, 3);
      return { product: p, quantity: qty, subtotal: parseFloat(p.price) * qty };
    });

    const totalAmount = items.reduce((sum, it) => sum + it.subtotal, 0);

    const order = await Order.create({
      id: randomUUID(),
      userId: user.id,
      status: 'pending',
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
      productId: it.product.id,
      productName: it.product.name,
      unitPrice: parseFloat(it.product.price),
      quantity: it.quantity,
      subtotal: it.subtotal,
    })));

    await Payment.create({
      orderId: order.id,
      method: pick(PAYMENT_METHODS),
      status: 'pending',
      amount: totalAmount,
      createdAt: now,
      updatedAt: now,
    });
  }

  console.log(`[${now.toISOString()}] Added ${count} orders`);
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
