import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import CartSidebar from './components/CartSidebar';
import ScrollToTop from './components/ScrollToTop';
import LoadingScreen from './components/LoadingScreen';
import Home from './pages/Home';
import Shop from './pages/Shop';
import AboutUs from './pages/AboutUs';
import Contact from './pages/Contact';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import CheckoutSuccess from './pages/CheckoutSuccess';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import { CartProvider } from './context/CartContext';
import { AdminProvider } from './context/AdminContext';

function App() {
  return (
    <CartProvider>
      <AdminProvider>
        <Router>
          <ScrollToTop />
          <LoadingScreen />
          <Routes>
            {/* Admin Routes (no header/footer) */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            
            {/* Public Routes (with header/footer) */}
            <Route path="/" element={
              <div className="min-h-screen bg-white">
                <Header />
                <Home />
                <Footer />
                <CartSidebar />
              </div>
            } />
            <Route path="/shop/*" element={
              <div className="min-h-screen bg-white">
                <Header />
                <Shop />
                <Footer />
                <CartSidebar />
              </div>
            } />
            <Route path="/product/:productId" element={
              <div className="min-h-screen bg-white">
                <Header />
                <ProductDetail />
                <Footer />
                <CartSidebar />
              </div>
            } />
            <Route path="/checkout" element={
              <div className="min-h-screen bg-white">
                <Header />
                <Checkout />
                <Footer />
                <CartSidebar />
              </div>
            } />
            <Route path="/checkout/success" element={
              <div className="min-h-screen bg-white">
                <CheckoutSuccess />
              </div>
            } />
            <Route path="/about" element={
              <div className="min-h-screen bg-white">
                <Header />
                <AboutUs />
                <Footer />
                <CartSidebar />
              </div>
            } />
            <Route path="/contact" element={
              <div className="min-h-screen bg-white">
                <Header />
                <Contact />
                <Footer />
                <CartSidebar />
              </div>
            } />
          </Routes>
        </Router>
      </AdminProvider>
    </CartProvider>
  );
}

export default App;
