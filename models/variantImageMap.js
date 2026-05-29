import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const VariantImageMap = sequelize.define('VariantImageMap', {
  variantId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'product_variants', key: 'id' },
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
  tableName: 'variant_image_maps',
  underscored: true,
  timestamps: false,
});

export default VariantImageMap;
