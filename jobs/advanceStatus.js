import sequelize from '../config/db.js';
import { Order, OrderItem, ProductVariant } from '../models/index.js';
import { Op } from 'sequelize';

export async function advanceOrderStatus() {
  const now = new Date();

  const daysAgo = (days) => new Date(now - days * 24 * 60 * 60 * 1000);

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
  }

  // paid 超過 1 天 → shipped
  const [shippedCount] = await sequelize.query(`
    UPDATE orders SET status = 'shipped', updated_at = NOW()
    WHERE status = 'paid' AND updated_at < :cutoff
  `, { replacements: { cutoff: daysAgo(1) }, type: sequelize.QueryTypes.UPDATE });

  // shipped 超過 2 天 → delivered
  const [deliveredCount] = await sequelize.query(`
    UPDATE orders SET status = 'delivered', updated_at = NOW()
    WHERE status = 'shipped' AND updated_at < :cutoff
  `, { replacements: { cutoff: daysAgo(2) }, type: sequelize.QueryTypes.UPDATE });

  console.log(`[advanceStatus] cancelled=${pendingOrders.length} shipped=${shippedCount} delivered=${deliveredCount}`);
}
