import 'dotenv/config';
import express from 'express';
import sequelize from './config/db.js';
import routes from './routes/index.js';
import errorHandler from './middlewares/errorHandler.js';

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 4000;

app.use(routes);
app.use(errorHandler);

sequelize
  .authenticate()
  .then(() => console.log('Database connected'))
  .catch((err) => console.error('Database connection failed:', err.message));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
