require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDb = require('./config/db');
const routes = require('./routes');
const errorMiddleware = require('./middlewares/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 3000;

// middlewares
app.use(express.json());
app.use(cors());

// quick health check route
let dbConnected = false;
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    dbConnected,
    timestamp: new Date().toISOString()
  });
});

// main API
app.use('/api', routes);

// error handler
app.use(errorMiddleware);

// start server
const server = app.listen(PORT, async () => {
  console.log(`Server listening on port ${PORT}`);
  try {
    await connectDb();
    dbConnected = true;
    console.log('MongoDB connected');
  } catch (err) {
    dbConnected = false;
    console.error('MongoDB connection error:', err?.message || err);
  }
});

server.on('error', (err) => {
  console.error('Server error:', err);
  process.exit(1);
});
