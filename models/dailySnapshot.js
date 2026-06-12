import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const DailySnapshot = sequelize.define('DailySnapshot', {
  date: {
    type: DataTypes.DATEONLY,
    primaryKey: true,
  },
  revenue: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  orderCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  newUserCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  avgOrderValue: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  topProducts: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
  topCategories: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
  paymentMethods: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
}, {
  tableName: 'daily_snapshots',
  underscored: true,
  timestamps: false,
});

export default DailySnapshot;
