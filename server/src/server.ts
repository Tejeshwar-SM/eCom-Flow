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

// Add this route for testing emails (REMOVE IN PRODUCTION)
app.post("/api/test-email", async (req, res) => {
  try {
    // Log environment variables for debugging
    console.log("Email Config Check:");
    console.log("MAIL_HOST:", process.env.MAIL_HOST);
    console.log("MAIL_PORT:", process.env.MAIL_PORT);
    console.log(
      "MAIL_USERNAME:",
      process.env.MAIL_USERNAME ? "SET" : "NOT SET"
    );
    console.log(
      "MAIL_PASSWORD:",
      process.env.MAIL_PASSWORD ? "SET" : "NOT SET"
    );

    const { emailService } = await import("./services/emailService");

    // Complete test customer data
    const testCustomer: ICustomer = {
      fullName: "John Doe",
      email: "test@example.com",
      phone: "+1234567890",
      address: {
        street: "123 Test Street",
        city: "Test City",
        state: "Test State",
        zipCode: "12345",
        country: "United States",
      },
    };

    // Complete test order data matching IOrder interface
    const testOrder: IOrder = {
      orderNumber: "ORD-TEST-123",
      customer: testCustomer, // Full customer object instead of string ID
      product: {
        productId: "507f1f77bcf86cd799439011", // Valid ObjectId format
        name: "Test Product",
        price: 99.99,
        quantity: 2,
        selectedVariants: [{ type: "color", value: "blue" }],
        image: "https://via.placeholder.com/300x300?text=Test+Product",
      },
      paymentInfo: {
        cardNumber: "1234", // Last 4 digits only
        expiryDate: "12/25",
        cardholderName: "John Doe",
      },
      status: "approved",
      subtotal: 199.98,
      tax: 16.0,
      total: 215.98,
      createdAt: new Date(),
    };

    // Test success email
    await emailService.sendOrderConfirmation(testOrder, testCustomer);

    // Test failure email with different order
    const failureOrder: IOrder = {
      ...testOrder,
      orderNumber: "ORD-FAIL-456",
      status: "declined",
    };

    await emailService.sendOrderFailure(failureOrder, testCustomer, "declined");

    res.json({
      success: true,
      message: "Test emails sent successfully!",
      emailsSent: ["Order Confirmation", "Payment Failure"],
    });
  } catch (error) {
    console.error("Email test failed:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      details: "Check server logs for more information",
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
