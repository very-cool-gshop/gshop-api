import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const ProductImageMap = sequelize.define('ProductImageMap', {
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'products', key: 'id' },
  },
  imageId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'product_images', key: 'id' },
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: 'product_image_maps',
  underscored: true,
  timestamps: false,
});

export default ProductImageMap;
