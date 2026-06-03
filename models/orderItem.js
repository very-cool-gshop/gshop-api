import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const OrderItem = sequelize.define('OrderItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  orderId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'orders', key: 'id' },
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'products', key: 'id' },
  },
  variantId: {
    type: DataTypes.INTEGER,
    allowNull: true, // nullable，避免 variant 被刪後歷史訂單壞掉
    references: { model: 'product_variants', key: 'id' },
  },
  productName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  variantName: {
    type: DataTypes.STRING, // 快照，e.g. "紅 / M"
  },
  unitPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
}, {
  tableName: 'order_items',
  underscored: true,
  timestamps: false,
});

export default OrderItem;
