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

function randomDate(daysAgo) {
  const now = Date.now();
  const past = now - daysAgo * 24 * 60 * 60 * 1000;
  return new Date(past + Math.random() * (now - past));
}

function deriveStatus(createdAt) {
  const ageInDays = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
  const r = Math.random();
  if (ageInDays < 1)  return pick(['pending', 'paid']);
  if (ageInDays < 3)  return r < 0.1 ? 'cancelled' : pick(['paid', 'shipped']);
  if (ageInDays < 7)  return r < 0.08 ? 'cancelled' : pick(['shipped', 'delivered']);
  return r < 0.05 ? 'cancelled' : 'delivered';
}

async function seed() {
  await sequelize.authenticate();
  console.log('Connected to DB');

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

  const TOTAL_ORDERS = 1000;
  let created = 0;

  for (let i = 0; i < TOTAL_ORDERS; i++) {
    const createdAt = randomDate(180);
    const status = deriveStatus(createdAt);
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
      status,
      totalAmount,
      discountAmount: 0,
      address: user.address,
      recipientName: user.name,
      recipientPhone: user.phone,
      createdAt,
      updatedAt: createdAt,
    });

    await OrderItem.bulkCreate(items.map(it => ({
      orderId: order.id,
      productId: it.product.id,
      productName: it.product.name,
      unitPrice: parseFloat(it.product.price),
      quantity: it.quantity,
      subtotal: it.subtotal,
    })));

    const paymentStatus = status === 'pending' ? 'pending'
      : status === 'cancelled' ? pick(['pending', 'failed'])
      : 'paid';

    await Payment.create({
      orderId: order.id,
      method: pick(PAYMENT_METHODS),
      status: paymentStatus,
      amount: totalAmount,
      transactionId: paymentStatus === 'paid' ? `TXN${Date.now()}${randInt(100, 999)}` : null,
      paidAt: paymentStatus === 'paid' ? createdAt : null,
      createdAt,
      updatedAt: createdAt,
    });

    created++;
    if (created % 20 === 0) console.log(`  ${created} / ${TOTAL_ORDERS} orders created`);
  }

  console.log(`Done! Created ${created} orders.`);
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
