import 'dotenv/config';
import express from 'express';
import sequelize from './db.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.get('/ping', (req, res) => {
  res.json({ message: 'pong' });
});

sequelize.authenticate()
  .then(() => console.log('Database connected'))
  .catch((err) => console.error('Database connection failed:', err.message));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
