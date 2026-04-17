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
import AddProduct from './pages/AddProduct';
import { CartProvider } from './context/CartContext';

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-black">
      <Header />
      {children}
      <Footer />
      <CartSidebar />
    </div>
  );
}

function App() {
  return (
    <CartProvider>
      <Router>
        <ScrollToTop />
        <LoadingScreen />
        <Routes>
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/shop/*" element={<Layout><Shop /></Layout>} />
          <Route path="/product/:productId" element={<Layout><ProductDetail /></Layout>} />
          <Route path="/checkout" element={<Layout><Checkout /></Layout>} />
          <Route path="/checkout/success" element={<div className="min-h-screen bg-white"><CheckoutSuccess /></div>} />
          <Route path="/about" element={<Layout><AboutUs /></Layout>} />
          <Route path="/contact" element={<Layout><Contact /></Layout>} />
          <Route path="/add" element={<Layout><AddProduct /></Layout>} />
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;
