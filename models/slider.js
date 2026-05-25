import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Slider = sequelize.define('Slider', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
  },
  subtitle: {
    type: DataTypes.STRING,
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'products', key: 'id' },
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  startAt: {
    type: DataTypes.DATE,
  },
  endAt: {
    type: DataTypes.DATE,
  },
}, {
  tableName: 'sliders',
  underscored: true,
});

export default Slider;
