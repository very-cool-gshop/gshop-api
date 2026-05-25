import { DataTypes } from 'sequelize';
import bcrypt from 'bcrypt';
import sequelize from '../config/db.js';
import { uploadBufferToGCS } from '../utils/upload.js';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
  },
  avatar: {
    type: DataTypes.STRING,
  },
  role: {
    type: DataTypes.ENUM('customer', 'admin'),
    defaultValue: 'customer',
  },
}, {
  tableName: 'users',
  underscored: true,
  hooks: {
    beforeCreate: async (user) => {
      user.password = await bcrypt.hash(user.password, 12);
    },
    afterCreate: async (user) => {
      const seed = Math.random().toString(36).slice(2, 10);
      const res = await fetch(`https://api.dicebear.com/9.x/shapes/svg?seed=${seed}`);
      const buffer = Buffer.from(await res.arrayBuffer());
      const avatar = await uploadBufferToGCS(buffer, `avatars/${seed}.svg`, 'image/svg+xml');
      await user.update({ avatar });
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    },
  },
});

export default User;
