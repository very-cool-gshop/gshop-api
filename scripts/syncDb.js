import sequelize from '../config/db.js';
import '../models/index.js';

// sync()                - table 不存在才建立，已存在不動
// sync({ alter: true }) - 比對差異，自動新增/修改欄位
// sync({ force: true }) - 先刪掉 table 再重建（資料會清空）
await sequelize.sync({ alter: true });
console.log('Database synced');
process.exit(0);
