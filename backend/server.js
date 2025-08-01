import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import simulationsRoutes from "./routes/simulations.js";
import importRoutes from "./routes/import.js"; // New import route
import { authenticateToken } from "./middleware/auth.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/simulations", simulationsRoutes);
app.use("/api/simulations", importRoutes); // Add import routes under simulations

// Protected route example
app.get("/api/protected", authenticateToken, (req, res) => {
  res.json({ message: "Access granted", user: req.user });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res
    .status(200)
    .json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Server error:", error);
  res.status(500).json({ message: "Internal server error" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
