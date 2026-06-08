import sequelize from '../config/db.js';
import { Order, User, DailySnapshot } from '../models/index.js';

function toLocalDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

async function buildSnapshot(date) {
  const dateStr = toLocalDateStr(date);
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const [revenueRow] = await sequelize.query(`
    SELECT
      COALESCE(SUM(total_amount), 0) AS revenue,
      COUNT(*) AS paid_order_count
    FROM orders
    WHERE created_at >= :start AND created_at < :end
      AND status IN ('paid', 'shipped', 'delivered')
  `, { replacements: { start, end }, type: sequelize.QueryTypes.SELECT });

  const revenue = parseFloat(revenueRow.revenue) || 0;
  const paidOrderCount = parseInt(revenueRow.paid_order_count) || 0;
  const avgOrderValue = paidOrderCount > 0
    ? parseFloat((revenue / paidOrderCount).toFixed(2))
    : 0;

  const [{ count: orderCount }] = await sequelize.query(`
    SELECT COUNT(*) AS count FROM orders
    WHERE created_at >= :start AND created_at < :end
  `, { replacements: { start, end }, type: sequelize.QueryTypes.SELECT });

  const [{ count: newUserCount }] = await sequelize.query(`
    SELECT COUNT(*) AS count FROM users
    WHERE created_at >= :start AND created_at < :end
  `, { replacements: { start, end }, type: sequelize.QueryTypes.SELECT });

  const statusRows = await sequelize.query(`
    SELECT status, COUNT(*) AS count FROM orders
    WHERE created_at >= :start AND created_at < :end
    GROUP BY status
  `, { replacements: { start, end }, type: sequelize.QueryTypes.SELECT });
  const orderStatusDist = Object.fromEntries(statusRows.map(r => [r.status, parseInt(r.count)]));

  const topProducts = await sequelize.query(`
    SELECT oi.product_id AS "productId", oi.product_name AS "productName",
           SUM(oi.subtotal) AS "totalRevenue", SUM(oi.quantity) AS "totalQuantity"
    FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    WHERE o.created_at >= :start AND o.created_at < :end
      AND o.status NOT IN ('cancelled')
    GROUP BY oi.product_id, oi.product_name
    ORDER BY "totalRevenue" DESC
    LIMIT 10
  `, { replacements: { start, end }, type: sequelize.QueryTypes.SELECT });

  const topCategories = await sequelize.query(`
    SELECT p.category_id AS "categoryId", c.name AS "categoryName",
           SUM(oi.subtotal) AS "totalRevenue", SUM(oi.quantity) AS "totalQuantity"
    FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    JOIN products p ON p.id = oi.product_id
    JOIN categories c ON c.id = p.category_id
    WHERE o.created_at >= :start AND o.created_at < :end
      AND o.status NOT IN ('cancelled')
    GROUP BY p.category_id, c.name
    ORDER BY "totalRevenue" DESC
    LIMIT 10
  `, { replacements: { start, end }, type: sequelize.QueryTypes.SELECT });

  const paymentMethods = await sequelize.query(`
    SELECT pay.method, COUNT(*) AS count, SUM(pay.amount) AS amount
    FROM payments pay
    JOIN orders o ON o.id = pay.order_id
    WHERE o.created_at >= :start AND o.created_at < :end
      AND o.status IN ('paid', 'shipped', 'delivered')
    GROUP BY pay.method
  `, { replacements: { start, end }, type: sequelize.QueryTypes.SELECT });

  await DailySnapshot.upsert({
    date: dateStr,
    revenue,
    orderCount: parseInt(orderCount),
    newUserCount: parseInt(newUserCount),
    avgOrderValue,
    orderStatusDist,
    topProducts: topProducts.map(r => ({ ...r, totalRevenue: parseFloat(r.totalRevenue), totalQuantity: parseInt(r.totalQuantity) })),
    topCategories: topCategories.map(r => ({ ...r, totalRevenue: parseFloat(r.totalRevenue), totalQuantity: parseInt(r.totalQuantity) })),
    paymentMethods: paymentMethods.map(r => ({ ...r, count: parseInt(r.count), amount: parseFloat(r.amount) })),
  });

  return dateStr;
}

async function main() {
  const earliest = await Order.findOne({ order: [['createdAt', 'ASC']], attributes: ['createdAt'] });
  if (!earliest) {
    console.log('No orders found.');
    process.exit(0);
  }

  const start = new Date(earliest.createdAt);
  start.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const current = new Date(start);
  let count = 0;

  while (current < today) {
    const dateStr = await buildSnapshot(new Date(current));
    console.log(`✓ ${dateStr}`);
    current.setDate(current.getDate() + 1);
    count++;
  }

  console.log(`\nDone. Built ${count} snapshots.`);
  await sequelize.close();
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
