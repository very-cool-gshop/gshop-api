import sequelize from '../config/db.js';
import { Order, OrderItem, ProductVariant, Payment } from '../models/index.js';
import { Op } from 'sequelize';

export async function advanceOrderStatus() {
  const now = new Date();

  const daysAgo = (days) => new Date(now - days * 24 * 60 * 60 * 1000);
  const hoursAgo = (hours) => new Date(now - hours * 60 * 60 * 1000);

  // pending + payment paid 超過 1 小時 → paid
  const paid = await sequelize.query(`
    UPDATE orders SET status = 'paid', updated_at = NOW()
    WHERE status = 'pending' AND updated_at < :cutoff
      AND id IN (SELECT order_id FROM payments WHERE status = 'paid')
    RETURNING id
  `, { replacements: { cutoff: hoursAgo(1) }, type: sequelize.QueryTypes.SELECT });

  // pending 超過 3 天 → cancelled，補回庫存
  const pendingOrders = await Order.findAll({
    where: { status: 'pending', updatedAt: { [Op.lt]: daysAgo(3) } },
    include: [OrderItem],
  });
  for (const order of pendingOrders) {
    for (const item of order.OrderItems) {
      if (item.variantId) {
        await ProductVariant.increment('stock', { by: item.quantity, where: { id: item.variantId } });
      }
    }
    await order.update({ status: 'cancelled' });
    await Payment.update({ status: 'cancelled' }, { where: { orderId: order.id, status: 'pending' } });
  }

  // paid 超過 1 天 → shipped
  const shipped = await sequelize.query(`
    UPDATE orders SET status = 'shipped', updated_at = NOW()
    WHERE status = 'paid' AND updated_at < :cutoff RETURNING id
  `, { replacements: { cutoff: daysAgo(1) }, type: sequelize.QueryTypes.SELECT });

  // shipped 超過 2 天 → delivered
  const delivered = await sequelize.query(`
    UPDATE orders SET status = 'delivered', updated_at = NOW()
    WHERE status = 'shipped' AND updated_at < :cutoff RETURNING id
  `, { replacements: { cutoff: daysAgo(2) }, type: sequelize.QueryTypes.SELECT });

  return `paid=${paid.length} cancelled=${pendingOrders.length} shipped=${shipped.length} delivered=${delivered.length}`;
}
