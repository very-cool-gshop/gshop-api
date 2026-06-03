import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'users', key: 'id' },
  },
  status: {
    type: DataTypes.ENUM('pending', 'paid', 'shipped', 'delivered', 'cancelled'),
    defaultValue: 'pending',
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  discountAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  recipientName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  recipientPhone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  note: {
    type: DataTypes.TEXT,
  },
}, {
  tableName: 'orders',
  underscored: true,
});

export default Order;
