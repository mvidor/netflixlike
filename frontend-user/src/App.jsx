import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import MovieDetail from './pages/MovieDetail'
import MyRentals from './pages/MyRentals'
import Cart from './pages/Cart'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import NotFound from './pages/NotFound'
import ProtectedRoute from './components/auth/ProtectedRoute'
import { AuthProvider } from './context/AuthProvider'
import { CartProvider } from './context/CartContext'
import { NotificationProvider } from './context/NotificationContext'

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <CartProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/movie/:id" element={<MovieDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route
                path="/my-rentals"
                element={
                  <ProtectedRoute>
                    <MyRentals />
                  </ProtectedRoute>
                }
              />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </NotificationProvider>
    </AuthProvider>
  )
}

export default App
