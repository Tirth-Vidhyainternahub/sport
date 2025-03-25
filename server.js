require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const os = require("os");
const connectDB = require("./config/dbconfig");
const responseHandler = require("./utils/response");
const errorHandler = require("./utils/error");

// Import Routes
const authRoutes = require("./routes/auth.routes");
const testRoutes = require("./routes/test.routes");

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Middleware
app.use(cors()); // Enable CORS
app.use(morgan("dev")); // Logging
app.use(express.json()); // Parse JSON requests

// Routes
app.use("/api/v1/auth", authRoutes); // Authentication routes
app.use("/api/v1/test", testRoutes)

// Health Check Route
app.get("/api/v1/health", (req, res) => {
  try {
    const healthData = {
      status: "Healthy",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      memoryUsage: process.memoryUsage(),
      cpuUsage: os.loadavg(),
      platform: os.platform(),
      release: os.release(),
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      numberOfCpus: os.cpus().length,
      networkInterfaces: os.networkInterfaces(),
    };

    responseHandler(res, 200, "Server is healthy and running!", healthData);
  } catch (error) {
    errorHandler(res, 500, "Health check failed", error);
  }
});

// Global Error Handling
app.use((err, req, res, next) => {
  console.error(`[Error] ${err.message}`);
  errorHandler(res, err.status || 500, err.message || "Internal Server Error");
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 [Server] Running on port ${PORT}`);
});
