import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const VariantOptionValue = sequelize.define('VariantOptionValue', {
  variantId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'product_variants', key: 'id' },
  },
  optionValueId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'option_values', key: 'id' },
  },
}, {
  tableName: 'variant_option_values',
  underscored: true,
  timestamps: false,
});

export default VariantOptionValue;
