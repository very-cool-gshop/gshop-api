import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const OptionValue = sequelize.define('OptionValue', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  optionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'product_options', key: 'id' },
  },
  value: {
    type: DataTypes.STRING, // e.g. "紅", "S"
    allowNull: false,
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: 'option_values',
  underscored: true,
  timestamps: false,
});

export default OptionValue;
