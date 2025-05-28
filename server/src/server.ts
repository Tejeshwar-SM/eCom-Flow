import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';
import { errorHandler } from './middleware/errorHandler';

// Import routes
import productRoutes from './routes/products';
import orderRoutes from './routes/orders';
import checkoutRoutes from './routes/checkout';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'eCommerce Checkout API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api', checkoutRoutes);

// 404 handler for undefined routes
app.all('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: [
      'GET /api/health',
      'GET /api/products',
      'GET /api/products/:id',
      'POST /api/checkout',
      'GET /api/orders/:orderNumber',
      'POST /api/orders/:orderNumber/resend-email'
    ]
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Health check: http://localhost:${PORT}/api/health`);
      console.log(`📚 API Base URL: http://localhost:${PORT}/api`);
      console.log('📋 Available endpoints:');
      console.log('   GET  /api/products');
      console.log('   GET  /api/products/:id');
      console.log('   POST /api/checkout');
      console.log('   GET  /api/orders/:orderNumber');
      console.log('   POST /api/orders/:orderNumber/resend-email');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
