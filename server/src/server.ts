import express from "express";

import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import { connectDB } from "./config/database";
import { errorHandler } from "./middleware/errorHandler";
import productRoutes from "./routes/products";
import orderRoutes from "./routes/orders";
import paymentRoutes from "./routes/payment";
import { IOrder, ICustomer } from "./types";

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
    methods:['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders:['Content-Type', 'Authorization']
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Routes
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// Add this debug endpoint to your server.ts (after your existing routes)
app.get('/api/debug/products', async (req, res) => {
  try {
    const { default: Product } = await import('../src/models/Product');
    
    const totalProducts = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({ isActive: true });
    const inactiveProducts = await Product.countDocuments({ isActive: false });
    const noIsActiveField = await Product.countDocuments({ isActive: { $exists: false } });
    
    const sampleProducts = await Product.find({}).limit(3).lean();
    const activeSampleProducts = await Product.find({ isActive: true }).limit(3).lean();
    
    res.json({
      success: true,
      summary: {
        total: totalProducts,
        active: activeProducts,
        inactive: inactiveProducts,
        missingIsActive: noIsActiveField
      },
      sampleProducts: sampleProducts.map(p => ({
        _id: p._id,
        name: p.name,
        isActive: p.isActive,
        hasIsActiveField: p.hasOwnProperty('isActive')
      })),
      activeSampleProducts: activeSampleProducts.map(p => ({
        _id: p._id,
        name: p.name,
        isActive: p.isActive
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});


// Error handling middleware (should be last)
app.use(errorHandler);

// Handle 404 routes
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(
    `Client URL: ${process.env.CLIENT_URL || "http://localhost:3000"}`
  );
  console.log(`Email Host: ${process.env.MAIL_HOST || "Not configured"}`);
});

export default app;
