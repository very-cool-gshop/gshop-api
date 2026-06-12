import sequelize from '../config/db.js';
import { DailySnapshot, ProductVariant, Product } from '../models/index.js';
import { Op } from 'sequelize';

function toLocalDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

async function queryToday() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const [[revenue], [userRow], topProducts, topCategories, paymentMethods] = await Promise.all([
    sequelize.query(`
      SELECT
        COALESCE(SUM(total_amount) FILTER (WHERE status IN ('paid','shipped','delivered')), 0) AS revenue,
        COUNT(*) FILTER (WHERE status IN ('paid','shipped','delivered')) AS paid_count,
        COUNT(*) AS order_count
      FROM orders WHERE created_at >= :start AND created_at < :end
    `, { replacements: { start, end }, type: sequelize.QueryTypes.SELECT }),

    sequelize.query(`
      SELECT COUNT(*) AS count FROM users
      WHERE created_at >= :start AND created_at < :end
    `, { replacements: { start, end }, type: sequelize.QueryTypes.SELECT }),

    sequelize.query(`
      SELECT oi.product_id AS "productId", oi.product_name AS "productName",
             SUM(oi.subtotal) AS "totalRevenue", SUM(oi.quantity) AS "totalQuantity"
      FROM order_items oi JOIN orders o ON o.id = oi.order_id
      WHERE o.created_at >= :start AND o.created_at < :end AND o.status != 'cancelled'
      GROUP BY oi.product_id, oi.product_name
      ORDER BY "totalRevenue" DESC LIMIT 10
    `, { replacements: { start, end }, type: sequelize.QueryTypes.SELECT }),

    sequelize.query(`
      SELECT p.category_id AS "categoryId", c.name AS "categoryName",
             SUM(oi.subtotal) AS "totalRevenue", SUM(oi.quantity) AS "totalQuantity"
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      JOIN products p ON p.id = oi.product_id
      JOIN categories c ON c.id = p.category_id
      WHERE o.created_at >= :start AND o.created_at < :end AND o.status != 'cancelled'
      GROUP BY p.category_id, c.name
      ORDER BY "totalRevenue" DESC LIMIT 10
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

  return {
    date: toLocalDateStr(start),
    revenue: rev,
    orderCount: parseInt(revenue.order_count) || 0,
    newUserCount: parseInt(userRow.count) || 0,
    avgOrderValue: paidCount > 0 ? parseFloat((rev / paidCount).toFixed(2)) : 0,
    topProducts: topProducts.map(r => ({ ...r, totalRevenue: parseFloat(r.totalRevenue), totalQuantity: parseInt(r.totalQuantity) })),
    topCategories: topCategories.map(r => ({ ...r, totalRevenue: parseFloat(r.totalRevenue), totalQuantity: parseInt(r.totalQuantity) })),
    paymentMethods: paymentMethods.map(r => ({ method: r.method, count: parseInt(r.count), amount: parseFloat(r.amount) })),
  };
}

// GET /dashboard?days=30
export const getDashboard = async (req, res, next) => {
  try {
    const days = Math.min(parseInt(req.query.days) || 30, 365);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const since = new Date(today);
    since.setDate(since.getDate() - (days - 1));

    const [snapshots, todayData] = await Promise.all([
      DailySnapshot.findAll({
        where: { date: { [Op.gte]: toLocalDateStr(since), [Op.lt]: toLocalDateStr(today) } },
        order: [['date', 'ASC']],
        raw: true,
      }),
      queryToday(),
    ]);

    res.json([...snapshots, todayData]);
  } catch (err) {
    next(err);
  }
};

// GET /dashboard/order-status-dist
export const getOrderStatusDist = async (req, res, next) => {
  try {
    const rows = await sequelize.query(
      `SELECT status, COUNT(*) AS count FROM orders GROUP BY status ORDER BY status`,
      { type: sequelize.QueryTypes.SELECT }
    );
    res.json(Object.fromEntries(rows.map(r => [r.status, parseInt(r.count)])));
  } catch (err) {
    next(err);
  }
};

// GET /dashboard/low-stock?threshold=10
export const getLowStock = async (req, res, next) => {
  try {
    const threshold = parseInt(req.query.threshold) || 10;

    const variants = await ProductVariant.findAll({
      where: { stock: { [Op.lte]: threshold } },
      include: [{ model: Product, attributes: ['id', 'name', 'status'] }],
      order: [['stock', 'ASC']],
    });

    res.json(variants.map(v => ({
      variantId: v.id,
      variantName: v.name,
      stock: v.stock,
      productId: v.Product.id,
      productName: v.Product.name,
      productStatus: v.Product.status,
    })));
  } catch (err) {
    next(err);
  }
};
