import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const ProductOption = sequelize.define('ProductOption', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'products', key: 'id' },
  },
  name: {
    type: DataTypes.STRING, // e.g. "顏色", "尺寸"
    allowNull: false,
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: 'product_options',
  underscored: true,
  timestamps: false,
});

export default ProductOption;
