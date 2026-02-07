import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { OrderProvider } from './context/OrderContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import Loading from './components/Loading';

// Lazy Load Pages
const Home = lazy(() => import('./pages/Home'));
const Menu = lazy(() => import('./pages/Menu'));
const MapPage = lazy(() => import('./pages/MapPage'));
const Cart = lazy(() => import('./pages/Cart'));
const RestaurantDashboard = lazy(() => import('./pages/RestaurantDashboard'));
const RestaurantOrders = lazy(() => import('./pages/RestaurantOrders'));
const RestaurantIncome = lazy(() => import('./pages/RestaurantIncome'));
const RestaurantLocation = lazy(() => import('./pages/RestaurantLocation'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const RestaurantLogin = lazy(() => import('./pages/auth/RestaurantLogin'));
const RestaurantDetails = lazy(() => import('./pages/RestaurantDetails'));
const UserProfile = lazy(() => import('./pages/UserProfile'));
const RestaurantProfile = lazy(() => import('./pages/RestaurantProfile'));
const RestaurantMenu = lazy(() => import('./pages/RestaurantMenu'));
const EmailVerificationPending = lazy(() => import('./pages/auth/EmailVerificationPending'));
import EmailNotVerifiedRoute from './components/EmailNotVerifiedRoute';

const App = () => {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <ThemeProvider>
          <OrderProvider>
            <CartProvider>
              <Router>
                <Suspense fallback={<Loading />}>
                  <Routes>
                    {/* Auth Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/restaurant-login" element={<RestaurantLogin />} />
                    <Route path="/verify-email" element={
                      <EmailNotVerifiedRoute>
                        <EmailVerificationPending />
                      </EmailNotVerifiedRoute>
                    } />

                    {/* Dashboard exists outside the main layout for full screen effect */}
                    {/* Dashboard Routes */}
                    <Route path="/dashboard/orders" element={
                      <ProtectedRoute roleRequired="restaurant">
                        <Layout>
                          <RestaurantOrders />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    <Route path="/dashboard/menu" element={
                      <ProtectedRoute roleRequired="restaurant">
                        <Layout>
                          <RestaurantMenu />
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
                </Suspense>
              </Router>
            </CartProvider>
          </OrderProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </AuthProvider>
  );
}

export default App;