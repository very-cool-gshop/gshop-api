import sequelize from '../config/db.js';
import { DailySnapshot } from '../models/index.js';

function toTaipeiDateStr(date) {
  return date.toLocaleDateString('en-CA', { timeZone: 'Asia/Taipei' });
}

export async function buildDailySnapshot(targetDate) {
  const dateStr = targetDate
    ? toTaipeiDateStr(targetDate)
    : toTaipeiDateStr(new Date(Date.now() - 86400000));

  const start = new Date(`${dateStr}T00:00:00+08:00`);
  const end = new Date(start.getTime() + 86400000);

  const [[revenue], [userRow], topProducts, topCategories, paymentMethods] = await Promise.all([
    sequelize.query(`
      SELECT
        COALESCE(SUM(total_amount) FILTER (WHERE status IN ('paid','shipped','delivered')), 0) AS revenue,
        COUNT(*) FILTER (WHERE status IN ('paid','shipped','delivered')) AS paid_count,
        COUNT(*) AS order_count
      FROM orders WHERE created_at >= :start AND created_at < :end
    `, { replacements: { start, end }, type: sequelize.QueryTypes.SELECT }),

    sequelize.query(`
      SELECT COUNT(*) AS count FROM users WHERE created_at >= :start AND created_at < :end
    `, { replacements: { start, end }, type: sequelize.QueryTypes.SELECT }),

    sequelize.query(`
      SELECT oi.product_id AS "productId", oi.product_name AS "productName",
             SUM(oi.subtotal) AS "totalRevenue", SUM(oi.quantity) AS "totalQuantity"
      FROM order_items oi JOIN orders o ON o.id = oi.order_id
      WHERE o.created_at >= :start AND o.created_at < :end AND o.status != 'cancelled'
      GROUP BY oi.product_id, oi.product_name ORDER BY "totalRevenue" DESC LIMIT 10
    `, { replacements: { start, end }, type: sequelize.QueryTypes.SELECT }),

    sequelize.query(`
      SELECT p.category_id AS "categoryId", c.name AS "categoryName",
             SUM(oi.subtotal) AS "totalRevenue", SUM(oi.quantity) AS "totalQuantity"
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      JOIN products p ON p.id = oi.product_id
      JOIN categories c ON c.id = p.category_id
      WHERE o.created_at >= :start AND o.created_at < :end AND o.status != 'cancelled'
      GROUP BY p.category_id, c.name ORDER BY "totalRevenue" DESC LIMIT 10
    `, { replacements: { start, end }, type: sequelize.QueryTypes.SELECT }),

    sequelize.query(`
      SELECT pay.method, COUNT(*) AS count, SUM(pay.amount) AS amount
      FROM payments pay JOIN orders o ON o.id = pay.order_id
      WHERE o.created_at >= :start AND o.created_at < :end
        AND o.status IN ('paid','shipped','delivered')
      GROUP BY pay.method
    `, { replacements: { start, end }, type: sequelize.QueryTypes.SELECT }),
  ]);

  const rev = parseFloat(revenue.revenue) || 0;
  const paidCount = parseInt(revenue.paid_count) || 0;

  await DailySnapshot.upsert({
    date: dateStr,
    revenue: rev,
    orderCount: parseInt(revenue.order_count) || 0,
    newUserCount: parseInt(userRow.count) || 0,
    avgOrderValue: paidCount > 0 ? parseFloat((rev / paidCount).toFixed(2)) : 0,
    topProducts: topProducts.map(r => ({ ...r, totalRevenue: parseFloat(r.totalRevenue), totalQuantity: parseInt(r.totalQuantity) })),
    topCategories: topCategories.map(r => ({ ...r, totalRevenue: parseFloat(r.totalRevenue), totalQuantity: parseInt(r.totalQuantity) })),
    paymentMethods: paymentMethods.map(r => ({ method: r.method, count: parseInt(r.count), amount: parseFloat(r.amount) })),
  });

  return `Built snapshot for ${dateStr}`;
}
