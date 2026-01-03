import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { OrderProvider } from './context/OrderContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ActiveOrderTracker from './components/ActiveOrderTracker';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import RestaurantDashboard from './pages/RestaurantDashboard';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import RestaurantLogin from './pages/auth/RestaurantLogin';

const App = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <OrderProvider>
          <CartProvider>
            <Router>
              <Routes>
                {/* Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/restaurant-login" element={<RestaurantLogin />} />

                {/* Dashboard exists outside the main layout for full screen effect */}
                <Route path="/dashboard" element={
                  <ProtectedRoute roleRequired="restaurant">
                    <RestaurantDashboard />
                  </ProtectedRoute>
                } />

                {/* Main App Routes */}
                <Route path="/" element={
                  <Layout>
                    <Home />
                    <ActiveOrderTracker />
                  </Layout>
                } />

                <Route path="/menu" element={
                  <Layout>
                    <Menu />
                  </Layout>
                } />

                <Route path="/cart" element={
                  <Layout>
                    <ProtectedRoute>
                      <Cart />
                    </ProtectedRoute>
                  </Layout>
                } />
              </Routes>
            </Router>
          </CartProvider>
        </OrderProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;