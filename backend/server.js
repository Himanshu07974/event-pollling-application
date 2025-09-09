require('dotenv').config();
const express = require('express');
const connectDb = require('./config/db');
const routes = require('./routes'); // index.js inside routes/
const errorMiddleware = require('./middlewares/errorMiddleware');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());
app.use('/api', routes);
app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use(errorMiddleware);

const start = async () => {
  try {
    await connectDb();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

start();
