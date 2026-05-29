import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const ProductImage = sequelize.define('ProductImage', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  filename: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  size: {
    type: DataTypes.INTEGER,
  },
}, {
  tableName: 'product_images',
  underscored: true,
});

export default ProductImage;
