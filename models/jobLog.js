import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const JobLog = sequelize.define('JobLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  jobName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('success', 'error'),
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
  },
  duration: {
    type: DataTypes.INTEGER,
  },
}, {
  tableName: 'job_logs',
  underscored: true,
  updatedAt: false,
});

export default JobLog;
