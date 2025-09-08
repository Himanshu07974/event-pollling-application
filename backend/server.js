// backend/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDb = require("./config/db");
const routes = require("./routes"); // index.js inside routes/
const errorMiddleware = require("./middlewares/errorMiddleware");

const app = express();
const PORT = process.env.PORT || 5000;

// --------- Middleware ---------
app.use(express.json());

// CORS configuration
// Provide FRONTEND_ORIGINS as a comma-separated list in .env, e.g.:
// FRONTEND_ORIGINS=http://localhost:3001,http://localhost:3000,https://your-frontend.vercel.app
const rawOrigins = process.env.FRONTEND_ORIGINS || "";
const allowedOrigins = rawOrigins
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

// If no FRONTEND_ORIGINS set, default to permissive CORS in development only.
// In production you should set FRONTEND_ORIGINS explicitly.
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) {
      // allow requests like curl/postman (no origin)
      return callback(null, true);
    }
    if (allowedOrigins.length === 0) {
      // no origins configured -> allow (useful for local dev)
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  credentials: true,
};

// Register CORS before routes so preflight is handled
app.use(cors(corsOptions));

// Optional: safe manual preflight responder (keeps things explicit)
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    const origin = req.headers.origin || "";
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      res.header("Access-Control-Allow-Origin", origin || "*");
      res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
      res.header("Access-Control-Allow-Headers", "Content-Type,Authorization,Accept");
      return res.sendStatus(200);
    }
    return res.status(403).send("CORS not allowed");
  }
  next();
});

// --------- Routes ---------
app.use("/api", routes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Error handling middleware (last)
app.use(errorMiddleware);

// --------- Start server ---------
const start = async () => {
  try {
    await connectDb();
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      if (allowedOrigins.length) {
        console.log("Allowed origins:", allowedOrigins.join(", "));
      } else {
        console.log("No FRONTEND_ORIGINS configured — CORS permissive for local dev");
      }
    });

    // graceful shutdown
    const shutdown = (signal) => {
      console.log(`Received ${signal}. Shutting down server...`);
      server.close(() => {
        console.log("HTTP server closed.");
        // if your connectDb exposed a close, you could call it here
        process.exit(0);
      });
      // force exit after 10s
      setTimeout(() => process.exit(1), 10000).unref();
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

start();
