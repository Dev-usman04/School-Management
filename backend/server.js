const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { Server } = require("socket.io");
const http = require("http");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const classRoutes = require("./routes/classes");
const attendanceRoutes = require("./routes/attendance");
const marksRoutes = require("./routes/marks");

const app = express();
const server = http.createServer(app);

// Enhanced CORS configuration
const io = new Server(server, { 
  cors: { 
    origin: ["http://localhost:3000", "http://localhost:5173", "http://localhost:4173", "http://127.0.0.1:5173", "https://school-management-m317.vercel.app"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"]
  } 
});

app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:5173", "http://localhost:4173", "http://127.0.0.1:5173", "https://school-management-m317.vercel.app"],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Make io accessible to routes
app.set("io", io);

// Health check route
app.get("/", (req, res) => {
  res.json({ message: "School Management API is running!" });
});

// Test route
app.get("/test", (req, res) => {
  res.json({ message: "Backend is working!" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/marks", marksRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || "mongodb://localhost/school", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Socket.IO
io.on("connection", (socket) => {
  console.log("🔌 User connected:", socket.id);
  socket.on("disconnect", () => console.log("🔌 User disconnected:", socket.id));
});

const PORT = process.env.PORT || 1000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}`);
  console.log(`🔌 Socket.IO available at http://localhost:${PORT}`);
});