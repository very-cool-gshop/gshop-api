import 'dotenv/config';
import express from 'express';
import sequelize from './config/db.js';
import User from './models/user.js';

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 4000;

app.get('/ping', (req, res) => {
  res.json({ message: 'pong' });
});

app.post('/users', async (req, res) => {
  const { name, email, password } = req.body;
  const user = await User.create({ name, email, password });
  res.status(201).json(user);
});

sequelize
  .authenticate()
  .then(() => console.log('Database connected'))
  .catch((err) => console.error('Database connection failed:', err.message));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
