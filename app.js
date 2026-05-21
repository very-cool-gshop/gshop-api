import express from 'express';

const app = express();
const PORT = process.env.PORT || 4000;

app.get('/ping', (req, res) => {
  res.json({ message: 'pong' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
