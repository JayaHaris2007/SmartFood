import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { OrderProvider } from './context/OrderContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

// Pages
import Home from './pages/Home';
import Menu from './pages/Menu';
import MapPage from './pages/MapPage';
import Cart from './pages/Cart';
import RestaurantDashboard from './pages/RestaurantDashboard';
import RestaurantOrders from './pages/RestaurantOrders';
import RestaurantIncome from './pages/RestaurantIncome';
import RestaurantLocation from './pages/RestaurantLocation';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import RestaurantLogin from './pages/auth/RestaurantLogin';
import RestaurantDetails from './pages/RestaurantDetails';
import UserProfile from './pages/UserProfile';
import RestaurantProfile from './pages/RestaurantProfile';

const App = () => {
  return (
    <AuthProvider>
      <ErrorBoundary>
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
                  {/* Dashboard Routes */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute roleRequired="restaurant">
                      <Layout>
                        <RestaurantDashboard />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  <Route path="/dashboard/orders" element={
                    <ProtectedRoute roleRequired="restaurant">
                      <Layout>
                        <RestaurantOrders />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  <Route path="/dashboard/income" element={
                    <ProtectedRoute roleRequired="restaurant">
                      <Layout>
                        <RestaurantIncome />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  <Route path="/dashboard/map" element={
                    <ProtectedRoute roleRequired="restaurant">
                      <Layout>
                        <RestaurantLocation />
                      </Layout>
                    </ProtectedRoute>
                  } />

                  {/* Main App Routes */}
                  <Route path="/" element={
                    <Layout>
                      <Home />
                    </Layout>
                  } />

                  <Route path="/menu" element={
                    <Layout>
                      <Menu />
                    </Layout>
                  } />

                  <Route path="/restaurant/:id" element={
                    <Layout>
                      <RestaurantDetails />
                    </Layout>
                  } />

                  <Route path="/map" element={
                    <Layout>
                      <MapPage />
                    </Layout>
                  } />

                  <Route path="/cart" element={
                    <Layout>
                      <ProtectedRoute>
                        <Cart />
                      </ProtectedRoute>
                    </Layout>
                  } />

                  <Route path="/profile" element={
                    <Layout>
                      <ProtectedRoute>
                        <UserProfile />
                      </ProtectedRoute>
                    </Layout>
                  } />

                  <Route path="/dashboard/profile" element={
                    <ProtectedRoute roleRequired="restaurant">
                      <Layout>
                        <RestaurantProfile />
                      </Layout>
                    </ProtectedRoute>
                  } />
                </Routes>
              </Router>
            </CartProvider>
          </OrderProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </AuthProvider>
  );
}

export default App;