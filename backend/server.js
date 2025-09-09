// backend/server.js
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

// quick health check route (responds immediately)
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

// debug: list registered routes (development only)
setTimeout(() => {
  try {
    const routes = [];
    app._router.stack.forEach((mw) => {
      if (mw.route && mw.route.path) routes.push(`/app${mw.route.path}`);
      else if (mw.name === 'router' && mw.handle && mw.handle.stack) {
        mw.handle.stack.forEach((h) => {
          if (h.route && h.route.path) routes.push(h.route.path);
        });
      }
    });
    console.log("=== Registered routes (subset) ===");
    console.log(routes.sort().join("\n"));
  } catch (e) {
    console.error("Route listing failed:", e);
  }
}, 600);

// error handler (after routes)
app.use(errorMiddleware);

// start server quickly so Render health check can reach it
const server = app.listen(PORT, async () => {
  console.log(`Server listening on port ${PORT}`);
  try {
    // attempt to connect DB but do not block the server from starting
    await connectDb();
    dbConnected = true;
    console.log('MongoDB connected');
  } catch (err) {
    dbConnected = false;
    console.error('MongoDB connection error:', err && err.message ? err.message : err);
    // do NOT process.exit(1) here — allow startup so health check has a chance
    // but you may choose to exit in production if DB is required.
  }
});

server.on('error', (err) => {
  console.error('Server error:', err);
  process.exit(1);
});
