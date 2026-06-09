import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import sequelize from './config/db.js';
import routes from './routes/index.js';
import errorHandler from './middlewares/errorHandler.js';
import { startJobs } from './jobs/index.js';

const REQUIRED_ENV = ['DATABASE_URL', 'JWT_SECRET'];
const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`Missing required env variables: ${missing.join(', ')}`);
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(routes);
app.use(errorHandler);

sequelize
  .authenticate()
  .then(() => console.log('Database connected'))
  .catch((err) => console.error('Database connection failed:', err.message));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startJobs();
});
