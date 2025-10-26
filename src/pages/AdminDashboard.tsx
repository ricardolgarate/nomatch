import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import {
  getAllProducts,
  saveProduct,
  ProductInventory,
  initializeProducts,
} from '../firebase/inventory';
import { getAnalyticsMetrics, AnalyticsMetrics } from '../firebase/analytics';
import { getAllCoupons, saveCoupon, deleteCoupon, Coupon } from '../firebase/coupons';
import { LogOut, Save, Package, TrendingUp, ShoppingCart, Eye, Users, CreditCard, XCircle, CheckCircle2, Ticket, Plus, Trash2 } from 'lucide-react';

// Hardcoded products from the website
const WEBSITE_PRODUCTS = [
  // Shoes
  { id: 'nomatch-classic', name: 'NoMatch Classic', price: '$170', category: 'Shoes', sku: '01-001-M-WL' },
  { id: 'bloom-color-changing', name: 'Bloom (Color Changing)', price: '$230', category: 'Shoes', sku: '01-002-M-BL' },
  { id: 'bloom-silver', name: 'Bloom Silver (Color Changing)', price: '$240', category: 'Shoes', sku: '01-003-M-BS' },
  { id: 'daisy-dream-silver', name: 'Daisy dream Silver (Color Changing)', price: '$240', category: 'Shoes', sku: '01-004-M-DS' },
  { id: 'daisy-dream', name: 'Daisy dream(Color Changing)', price: '$230', category: 'Shoes', sku: '01-005-M-DD' },
  { id: 'floral-snake', name: 'Floral snake', price: '$220', category: 'Shoes', sku: '01-006-M-FS' },
  { id: 'graffiti', name: 'Graffiti', price: '$220', category: 'Shoes', sku: '01-007-M-GR' },
  { id: 'graffiti-color-changing', name: 'Graffiti (Color Changing)', price: '$230', category: 'Shoes', sku: '01-008-M-GC' },
  { id: 'graffiti-silver', name: 'Graffiti Silver', price: '$240', category: 'Shoes', sku: '01-009-M-GS' },
  { id: 'monogram-bold', name: 'Monogram Bold', price: '$220', category: 'Shoes', sku: '01-010-M-MB' },
  { id: 'monogram-metallic', name: 'Monogram Metallic (Color Changing)', price: '$230', category: 'Shoes', sku: '01-011-M-MM' },
  { id: 'good-luck', name: 'Good luck', price: '$220', category: 'Shoes', sku: '01-012-M-GL' },
  { id: 'xoxo-color-changing', name: 'XOXO (Color Changing)', price: '$240', category: 'Shoes', sku: '01-013-M-XO' },
  { id: 'graffiti-pink', name: 'Graffiti Pink', price: '$240', category: 'Shoes', sku: '01-014-M-GP' },
  { id: 'love-color-changing', name: 'LOVE (Color Changing)', price: '$230', category: 'Shoes', sku: '01-015-M-LV' },
  { id: 'text-me-color-changing', name: 'Text me (Color Changing)', price: '$230', category: 'Shoes', sku: '01-016-M-TM' },
  { id: 'pillow-wedge-limited', name: 'Pillow Wedge – Limited Edition', price: '$250', category: 'Shoes', sku: '01-017-M-PW' },
  // Accessories
  { id: 'gold-signature-charm', name: 'Gold Signature Charm', price: '$20', category: 'Accessories', sku: 'A06GD' },
  { id: 'silver-signature-charm', name: 'Silver Signature Charm', price: '$15', category: 'Accessories', sku: 'A06SL' },
  // Clothing
  { id: 'bloom-cap-pink', name: 'Bloom UV-Activated Cap in Light Pink', price: '$38', category: 'Clothing', sku: 'CAP-BLM-PK' },
  { id: 'daisy-cap-yellow', name: 'Daisy Dreams UV Activated Cap in Yellow', price: '$38', category: 'Clothing', sku: 'CAP-DSY-YL' },
  { id: 'signature-cap-dark-pink', name: 'Signature "Made to NoMatch" UV-Activated Cap in Dark Pink', price: '$38', category: 'Clothing', sku: 'CAP-SIG-DPK' },
  { id: 'xoxo-cap-purple', name: 'XOXO UV-Activated Cap in Purple', price: '$38', category: 'Clothing', sku: 'CAP-XO-PUR' },
  { id: 'graffiti-hoodie', name: 'NoMatch Graffiti Hoodie', price: '$60', category: 'Clothing', sku: 'HOD-GRF' },
  { id: 'pink-signature-hoodie', name: 'NoMatch Pink Signature Hoodie', price: '$60', category: 'Clothing', sku: 'HOD-SIG-PK' },
];

const SHOE_SIZES = ['5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12'];
const CLOTHING_SIZES = ['XS', 'S', 'M', 'L', 'XL'];

export default function AdminDashboard() {
  const { isAdmin, logout, loading: authLoading } = useAdmin();
  const navigate = useNavigate();
  const [products, setProducts] = useState<ProductInventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [stockEdits, setStockEdits] = useState<{ [key: string]: any }>({});
  const [analytics, setAnalytics] = useState<AnalyticsMetrics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  
  // Coupon management state
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [showNewCoupon, setShowNewCoupon] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: 0,
    minPurchase: 0,
    maxDiscount: 0,
    usageLimit: 0,
    active: true,
    expiresAt: '',
  });

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/admin/login');
    }
  }, [isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      loadProducts();
      loadAnalytics();
      loadCoupons();
    }
  }, [isAdmin]);

  const loadAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      const metrics = await getAnalyticsMetrics();
      setAnalytics(metrics);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const data = await getAllProducts();
      setProducts(data);
      
      // Initialize stock edits with current values - ensure all sizes default to 0
      const edits: { [key: string]: any } = {};
      data.forEach(product => {
        if (product.sizes) {
          // Initialize all sizes with 0, then override with actual values
          const initialSizes: { [key: string]: number } = {};
          const sizesArray = product.category === 'Shoes' 
            ? SHOE_SIZES 
            : product.subcategory === 'Hoodie' 
              ? CLOTHING_SIZES 
              : [];
          
          // Set all sizes to 0 first
          sizesArray.forEach(size => {
            initialSizes[size] = 0;
          });
          
          // Then override with actual stock values
          Object.keys(product.sizes).forEach(size => {
            initialSizes[size] = product.sizes![size] || 0;
          });
          
          edits[product.id] = initialSizes;
        } else {
          edits[product.id] = product.stock || 0;
        }
      });
      setStockEdits(edits);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleInitialize = async () => {
    if (!confirm('This will initialize all products with sample stock. Continue?')) return;
    
    setLoading(true);
    try {
      await initializeProducts();
      await loadProducts();
      alert('Products initialized successfully!');
    } catch (error) {
      console.error('Error initializing products:', error);
      alert('Failed to initialize products');
    } finally {
      setLoading(false);
    }
  };

  // Load coupons
  const loadCoupons = async () => {
    try {
      const data = await getAllCoupons();
      setCoupons(data);
    } catch (error) {
      console.error('Error loading coupons:', error);
    }
  };

  // Handle new coupon creation
  const handleCreateCoupon = async () => {
    try {
      if (!newCoupon.code || newCoupon.value <= 0) {
        alert('Please enter a valid coupon code and value');
        return;
      }

      const coupon: any = {
        id: newCoupon.code.toLowerCase().replace(/\s+/g, '-'),
        code: newCoupon.code.toUpperCase(),
        type: newCoupon.type,
        value: newCoupon.type === 'percentage' ? newCoupon.value : Math.round(newCoupon.value * 100), // Convert dollars to cents for fixed
        usageCount: 0,
        active: newCoupon.active,
      };

      // Only add optional fields if they have values
      if (newCoupon.minPurchase > 0) {
        coupon.minPurchase = Math.round(newCoupon.minPurchase * 100);
      }
      if (newCoupon.maxDiscount > 0) {
        coupon.maxDiscount = Math.round(newCoupon.maxDiscount * 100);
      }
      if (newCoupon.usageLimit > 0) {
        coupon.usageLimit = newCoupon.usageLimit;
      }
      if (newCoupon.expiresAt) {
        coupon.expiresAt = new Date(newCoupon.expiresAt);
      }

      await saveCoupon(coupon);
      await loadCoupons();
      
      // Reset form
      setNewCoupon({
        code: '',
        type: 'percentage',
        value: 0,
        minPurchase: 0,
        maxDiscount: 0,
        usageLimit: 0,
        active: true,
        expiresAt: '',
      });
      setShowNewCoupon(false);
      
      alert('Coupon created successfully!');
    } catch (error) {
      console.error('Error creating coupon:', error);
      alert('Failed to create coupon');
    }
  };

  // Toggle coupon active status
  const handleToggleCoupon = async (coupon: Coupon) => {
    try {
      await saveCoupon({
        ...coupon,
        active: !coupon.active,
      });
      await loadCoupons();
    } catch (error) {
      console.error('Error toggling coupon:', error);
      alert('Failed to update coupon');
    }
  };

  // Delete coupon
  const handleDeleteCoupon = async (couponId: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) {
      return;
    }

    try {
      await deleteCoupon(couponId);
      await loadCoupons();
      alert('Coupon deleted successfully!');
    } catch (error) {
      console.error('Error deleting coupon:', error);
      alert('Failed to delete coupon');
    }
  };

  const handleStockChange = (productId: string, sizeOrStock: string, value: number) => {
    setStockEdits(prev => {
      const current = prev[productId];
      if (typeof current === 'object') {
        return {
          ...prev,
          [productId]: {
            ...current,
            [sizeOrStock]: value,
          },
        };
      } else {
        return {
          ...prev,
          [productId]: value,
        };
      }
    });
  };

  const handleSaveStock = async (productId: string) => {
    setSaving(productId);
    try {
      const product = products.find(p => p.id === productId);
      if (!product) return;

      const updatedProduct = {
        ...product,
        ...(typeof stockEdits[productId] === 'object' 
          ? { sizes: stockEdits[productId] }
          : { stock: stockEdits[productId] }
        ),
      };

      await saveProduct(updatedProduct);
      await loadProducts();
      alert('Stock updated successfully!');
    } catch (error) {
      console.error('Error saving stock:', error);
      alert('Failed to save stock');
    } finally {
      setSaving(null);
    }
  };

  const getProduct = (productInfo: typeof WEBSITE_PRODUCTS[0]) => {
    return products.find(p => p.id === productInfo.id);
  };

  if (authLoading || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-pink-100">
      <header className="bg-white/90 backdrop-blur-sm shadow-lg border-b border-pink-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img 
                src="/Logo-NoMatch.webp" 
                alt="NoMatch Logo" 
                className="w-12 h-12 object-contain"
              />
              <div>
                <h1 className="text-2xl font-serif font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Inventory Management
                </h1>
                <p className="text-sm text-gray-600">NoMatch Store - Stock Control</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-pink-100 to-purple-100 hover:from-pink-200 hover:to-purple-200 text-purple-700 rounded-xl transition-all font-medium shadow-sm"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-pink-100">
            <div className="animate-spin w-12 h-12 border-4 border-pink-400 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading inventory...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-pink-100">
            <Package className="w-16 h-16 text-pink-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Products in Database</h3>
            <p className="text-gray-600 mb-6">Click below to initialize your store inventory</p>
            <button
              onClick={handleInitialize}
              className="inline-flex items-center gap-2 px-8 py-3 bg-purple-600 text-white hover:bg-purple-700 transition-all duration-300 font-medium tracking-wider text-sm"
            >
              <Package className="w-5 h-5" />
              INITIALIZE STORE PRODUCTS
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Analytics Dashboard */}
            <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-2xl shadow-2xl p-8 text-white">
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="w-8 h-8" />
                <div>
                  <h2 className="text-3xl font-serif font-semibold">Store Analytics</h2>
                  <p className="text-pink-50">Real-time customer journey tracking</p>
                </div>
              </div>
              
              {analyticsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-12 h-12 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-pink-50">Loading analytics...</p>
                </div>
              ) : analytics ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Total Traffic */}
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/30">
                    <div className="flex items-center justify-between mb-2">
                      <Users className="w-8 h-8 text-white" />
                      <span className="text-3xl font-bold">{analytics.totalTraffic}</span>
                    </div>
                    <p className="text-pink-50 font-medium">Total Visitors</p>
                  </div>

                  {/* Shop Visits */}
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/30">
                    <div className="flex items-center justify-between mb-2">
                      <ShoppingCart className="w-8 h-8 text-white" />
                      <span className="text-3xl font-bold">{analytics.shopVisits}</span>
                    </div>
                    <p className="text-pink-50 font-medium">Shop Visits</p>
                  </div>

                  {/* Product Views */}
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/30">
                    <div className="flex items-center justify-between mb-2">
                      <Eye className="w-8 h-8 text-white" />
                      <span className="text-3xl font-bold">{analytics.productViews}</span>
                    </div>
                    <p className="text-pink-50 font-medium">Product Views</p>
                  </div>

                  {/* Conversion Rate */}
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/30">
                    <div className="flex items-center justify-between mb-2">
                      <TrendingUp className="w-8 h-8 text-white" />
                      <span className="text-3xl font-bold">{analytics.conversionRate}%</span>
                    </div>
                    <p className="text-pink-50 font-medium">Conversion Rate</p>
                  </div>

                  {/* Abandoned Carts */}
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/30">
                    <div className="flex items-center justify-between mb-2">
                      <ShoppingCart className="w-8 h-8 text-yellow-200" />
                      <span className="text-3xl font-bold">{analytics.abandonedCarts}</span>
                    </div>
                    <p className="text-pink-50 font-medium">Abandoned Carts</p>
                    <p className="text-xs text-pink-100 mt-1">Users who added to cart but didn't checkout</p>
                  </div>

                  {/* Initiated Checkouts */}
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/30">
                    <div className="flex items-center justify-between mb-2">
                      <CreditCard className="w-8 h-8 text-blue-200" />
                      <span className="text-3xl font-bold">{analytics.initiatedCheckouts}</span>
                    </div>
                    <p className="text-pink-50 font-medium">Initiated Checkout</p>
                    <p className="text-xs text-pink-100 mt-1">Started checkout but didn't complete</p>
                  </div>

                  {/* Payment Failed */}
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/30">
                    <div className="flex items-center justify-between mb-2">
                      <XCircle className="w-8 h-8 text-red-200" />
                      <span className="text-3xl font-bold">{analytics.paymentFailed}</span>
                    </div>
                    <p className="text-pink-50 font-medium">Payment Failed</p>
                    <p className="text-xs text-pink-100 mt-1">Payment attempted but failed</p>
                  </div>

                  {/* Successful Purchases */}
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/30">
                    <div className="flex items-center justify-between mb-2">
                      <CheckCircle2 className="w-8 h-8 text-green-200" />
                      <span className="text-3xl font-bold">{analytics.successfulPurchases}</span>
                    </div>
                    <p className="text-pink-50 font-medium">Successful Orders</p>
                    <p className="text-xs text-pink-100 mt-1">Completed purchases</p>
                  </div>
                </div>
              ) : (
                <p className="text-center text-pink-50">No analytics data available</p>
              )}
            </div>

            <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-2xl shadow-2xl p-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-serif font-semibold mb-2">Product Inventory</h2>
                  <p className="text-pink-50">Update stock quantities for all products and sizes</p>
                </div>
                <button
                  onClick={handleInitialize}
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-purple-600 hover:bg-pink-50 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                  <Package className="w-4 h-4" />
                  {loading ? 'REINITIALIZING...' : 'RE-INITIALIZE PRODUCTS'}
                </button>
              </div>
            </div>

            {/* Shoes Section */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-pink-100">
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 px-6 py-5 border-b border-pink-200">
                <h3 className="text-xl font-serif font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  👟 Shoes ({WEBSITE_PRODUCTS.filter(p => p.category === 'Shoes').length} Models)
                </h3>
              </div>
              <div className="p-6 space-y-6">
                {WEBSITE_PRODUCTS.filter(p => p.category === 'Shoes').map((productInfo) => {
                  const product = getProduct(productInfo);
                  const currentStock = stockEdits[productInfo.id] || {};
                  
                  return (
                    <div key={productInfo.id} className="border-2 border-pink-100 rounded-xl p-5 hover:border-purple-300 hover:shadow-lg transition-all bg-gradient-to-br from-white to-pink-50/30">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 text-lg">{productInfo.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">SKU: {productInfo.sku} • {productInfo.price}</p>
                        </div>
                        <button
                          onClick={() => handleSaveStock(productInfo.id)}
                          disabled={saving === productInfo.id || !product}
                          className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 text-white hover:bg-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                          <Save className="w-4 h-4" />
                          {saving === productInfo.id ? 'SAVING...' : 'SAVE'}
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-11 gap-3">
                        {SHOE_SIZES.map((size) => (
                          <div key={size}>
                            <label className="block text-xs font-semibold text-purple-700 mb-1.5 text-center">
                              Size {size}
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={currentStock[size] || 0}
                              onChange={(e) => handleStockChange(productInfo.id, size, parseInt(e.target.value) || 0)}
                              className="w-full px-2 py-2.5 text-center border-2 border-pink-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all font-medium"
                              disabled={!product}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Accessories Section */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-pink-100">
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 px-6 py-5 border-b border-pink-200">
                <h3 className="text-xl font-serif font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  ✨ Accessories ({WEBSITE_PRODUCTS.filter(p => p.category === 'Accessories').length} Items)
                </h3>
              </div>
              <div className="p-6 space-y-4">
                {WEBSITE_PRODUCTS.filter(p => p.category === 'Accessories').map((productInfo) => {
                  const product = getProduct(productInfo);
                  const currentStock = stockEdits[productInfo.id] || 0;
                  
                  return (
                    <div key={productInfo.id} className="border-2 border-pink-100 rounded-xl p-5 hover:border-purple-300 hover:shadow-lg transition-all bg-gradient-to-br from-white to-pink-50/30">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 text-lg">{productInfo.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">SKU: {productInfo.sku} • {productInfo.price}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-purple-700 mb-1.5 text-center">
                              Stock Quantity
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={currentStock || 0}
                              onChange={(e) => handleStockChange(productInfo.id, 'stock', parseInt(e.target.value) || 0)}
                              className="w-32 px-3 py-2.5 text-center border-2 border-pink-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all font-medium"
                              disabled={!product}
                            />
                          </div>
                          <button
                            onClick={() => handleSaveStock(productInfo.id)}
                            disabled={saving === productInfo.id || !product}
                            className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 text-white hover:bg-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                          >
                            <Save className="w-4 h-4" />
                            {saving === productInfo.id ? 'SAVING...' : 'SAVE'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Clothing Section */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-pink-100">
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 px-6 py-5 border-b border-pink-200">
                <h3 className="text-xl font-serif font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  👕 Clothing ({WEBSITE_PRODUCTS.filter(p => p.category === 'Clothing').length} Items)
                </h3>
              </div>
              <div className="p-6 space-y-4">
                {WEBSITE_PRODUCTS.filter(p => p.category === 'Clothing').map((productInfo) => {
                  const product = getProduct(productInfo);
                  const currentStock = stockEdits[productInfo.id] || 0;
                  const isHoodie = productInfo.sku.startsWith('HOD-');
                  
                  return (
                    <div key={productInfo.id} className="border-2 border-pink-100 rounded-xl p-5 hover:border-purple-300 hover:shadow-lg transition-all bg-gradient-to-br from-white to-pink-50/30">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 text-lg">{productInfo.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">SKU: {productInfo.sku} • {productInfo.price}</p>
                        </div>
                        <button
                          onClick={() => handleSaveStock(productInfo.id)}
                          disabled={saving === productInfo.id || !product}
                          className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 text-white hover:bg-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium rounded-lg"
                        >
                          <Save className="w-4 h-4" />
                          {saving === productInfo.id ? 'SAVING...' : 'SAVE'}
                        </button>
                      </div>
                      
                      {isHoodie ? (
                        <div className="grid grid-cols-4 gap-3">
                          {CLOTHING_SIZES.map((size) => (
                            <div key={size}>
                              <label className="block text-xs font-semibold text-purple-700 mb-1.5 text-center">
                                Size {size}
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={currentStock[size] || 0}
                                onChange={(e) => handleStockChange(productInfo.id, size, parseInt(e.target.value) || 0)}
                                className="w-full px-2 py-2.5 text-center border-2 border-pink-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all font-medium"
                                disabled={!product}
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-purple-700 mb-1.5 text-center">
                              Stock Quantity
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={currentStock || 0}
                              onChange={(e) => handleStockChange(productInfo.id, 'stock', parseInt(e.target.value) || 0)}
                              className="w-32 px-3 py-2.5 text-center border-2 border-pink-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all font-medium"
                              disabled={!product}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Coupons Section */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-pink-100">
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 px-6 py-5 border-b border-pink-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-serif font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    🎟️ Coupons ({coupons.length} Total)
                  </h3>
                  <button
                    onClick={() => setShowNewCoupon(!showNewCoupon)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white hover:bg-purple-700 transition-all duration-300 rounded-lg font-medium text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    {showNewCoupon ? 'Cancel' : 'New Coupon'}
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                {/* New Coupon Form */}
                {showNewCoupon && (
                  <div className="border-2 border-purple-300 rounded-xl p-6 bg-gradient-to-br from-purple-50 to-pink-50">
                    <h4 className="font-semibold text-gray-900 text-lg mb-4">Create New Coupon</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Coupon Code *
                        </label>
                        <input
                          type="text"
                          value={newCoupon.code}
                          onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                          placeholder="e.g., WELCOME10"
                          className="w-full px-4 py-2.5 border-2 border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Discount Type *
                        </label>
                        <select
                          value={newCoupon.type}
                          onChange={(e) => setNewCoupon({ ...newCoupon, type: e.target.value as 'percentage' | 'fixed' })}
                          className="w-full px-4 py-2.5 border-2 border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                        >
                          <option value="percentage">Percentage Off (%)</option>
                          <option value="fixed">Fixed Amount ($)</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          {newCoupon.type === 'percentage' ? 'Percentage (%)' : 'Amount ($)'} *
                        </label>
                        <input
                          type="number"
                          value={newCoupon.value}
                          onChange={(e) => setNewCoupon({ ...newCoupon, value: parseFloat(e.target.value) || 0 })}
                          placeholder={newCoupon.type === 'percentage' ? '10' : '15.00'}
                          step={newCoupon.type === 'percentage' ? '1' : '0.01'}
                          min="0"
                          max={newCoupon.type === 'percentage' ? '100' : undefined}
                          className="w-full px-4 py-2.5 border-2 border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Min Purchase ($)
                        </label>
                        <input
                          type="number"
                          value={newCoupon.minPurchase}
                          onChange={(e) => setNewCoupon({ ...newCoupon, minPurchase: parseFloat(e.target.value) || 0 })}
                          placeholder="0 (no minimum)"
                          step="0.01"
                          min="0"
                          className="w-full px-4 py-2.5 border-2 border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                        />
                      </div>
                      
                      {newCoupon.type === 'percentage' && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Max Discount ($)
                          </label>
                          <input
                            type="number"
                            value={newCoupon.maxDiscount}
                            onChange={(e) => setNewCoupon({ ...newCoupon, maxDiscount: parseFloat(e.target.value) || 0 })}
                            placeholder="0 (no max)"
                            step="0.01"
                            min="0"
                            className="w-full px-4 py-2.5 border-2 border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                          />
                        </div>
                      )}
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Usage Limit
                        </label>
                        <input
                          type="number"
                          value={newCoupon.usageLimit}
                          onChange={(e) => setNewCoupon({ ...newCoupon, usageLimit: parseInt(e.target.value) || 0 })}
                          placeholder="0 (unlimited)"
                          min="0"
                          className="w-full px-4 py-2.5 border-2 border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Expires At
                        </label>
                        <input
                          type="date"
                          value={newCoupon.expiresAt}
                          onChange={(e) => setNewCoupon({ ...newCoupon, expiresAt: e.target.value })}
                          className="w-full px-4 py-2.5 border-2 border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                        />
                      </div>
                    </div>
                    
                    <button
                      onClick={handleCreateCoupon}
                      className="w-full px-6 py-3 bg-pink-500 text-white hover:bg-pink-600 transition-all duration-300 font-medium rounded-lg"
                    >
                      Create Coupon
                    </button>
                  </div>
                )}

                {/* Existing Coupons List */}
                {coupons.length === 0 && !showNewCoupon ? (
                  <div className="text-center py-12 text-gray-500">
                    <Ticket className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p>No coupons created yet</p>
                    <p className="text-sm mt-2">Click "New Coupon" to create your first coupon</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {coupons.map((coupon) => (
                      <div
                        key={coupon.id}
                        className={`border-2 rounded-xl p-5 transition-all ${
                          coupon.active
                            ? 'border-green-200 bg-gradient-to-br from-white to-green-50/30'
                            : 'border-gray-200 bg-gray-50 opacity-60'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-2xl font-bold text-purple-600 font-mono">
                                {coupon.code}
                              </span>
                              {coupon.active ? (
                                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
                                  ACTIVE
                                </span>
                              ) : (
                                <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs font-semibold rounded">
                                  INACTIVE
                                </span>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-700">
                              <p>
                                <strong>Discount:</strong>{' '}
                                {coupon.type === 'percentage'
                                  ? `${coupon.value}%`
                                  : `$${(coupon.value / 100).toFixed(2)}`}
                              </p>
                              <p>
                                <strong>Used:</strong> {coupon.usageCount}
                                {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ' (unlimited)'}
                              </p>
                              {coupon.minPurchase && (
                                <p>
                                  <strong>Min Purchase:</strong> ${(coupon.minPurchase / 100).toFixed(2)}
                                </p>
                              )}
                              {coupon.maxDiscount && (
                                <p>
                                  <strong>Max Discount:</strong> ${(coupon.maxDiscount / 100).toFixed(2)}
                                </p>
                              )}
                              {coupon.expiresAt && (
                                <p>
                                  <strong>Expires:</strong> {new Date(coupon.expiresAt).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleToggleCoupon(coupon)}
                              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                coupon.active
                                  ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                  : 'bg-green-100 text-green-700 hover:bg-green-200'
                              }`}
                            >
                              {coupon.active ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => handleDeleteCoupon(coupon.id)}
                              className="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg font-medium transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
