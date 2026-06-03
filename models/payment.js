import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Payment = sequelize.define('Payment', {
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
  method: {
    type: DataTypes.ENUM('credit_card', 'bank_transfer', 'cod'),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
    defaultValue: 'pending',
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  transactionId: {
    type: DataTypes.STRING,
  },
  paidAt: {
    type: DataTypes.DATE,
  },
}, {
  tableName: 'payments',
  underscored: true,
});

export default Payment;
