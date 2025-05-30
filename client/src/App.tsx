// import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { OrderProvider } from './contexts/OrderContext';
import Landing from './pages/Landing';
import Checkout from './pages/Checkout';
import ThankYou from './pages/ThankYou';
import ErrorBoundary from './components/ErrorBoundary';
import './styles/globals.css';

function App() {
  return (
    <ErrorBoundary>
      <OrderProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              {/* Landing Page - Product Display */}
              <Route path="/" element={<Landing />} />
              
              {/* Checkout Page - Form and Payment */}
              <Route path="/checkout" element={<Checkout />} />
              
              {/* Thank You Page - Order Confirmation */}
              <Route path="/thank-you/:orderNumber" element={<ThankYou />} />
              
              {/* Redirect any unknown routes to landing */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            
            {/* Global Toast Notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#1F2937',
                  color: '#F9FAFB',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  fontSize: '14px',
                  fontWeight: '500'
                },
                success: {
                  style: {
                    background: '#059669',
                  },
                  iconTheme: {
                    primary: '#FFFFFF',
                    secondary: '#059669',
                  },
                },
                error: {
                  style: {
                    background: '#DC2626',
                  },
                  iconTheme: {
                    primary: '#FFFFFF',
                    secondary: '#DC2626',
                  },
                },
                loading: {
                  style: {
                    background: '#3B82F6',
                  },
                  iconTheme: {
                    primary: '#FFFFFF',
                    secondary: '#3B82F6',
                  },
                },
              }}
            />
          </div>
        </Router>
      </OrderProvider>
    </ErrorBoundary>
  );
}

export default App;