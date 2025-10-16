import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Package, Clock, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { getProduct, ProductInventory } from '../firebase/inventory';
import { trackEvent } from '../firebase/analytics';

// Fallback hardcoded products
const fallbackProducts = [
  // Shoes
  {
    id: 'nomatch-classic',
    name: 'NoMatch Classic',
    price: '$170',
    sku: '01-001-M-WL',
    category: 'Shoes',
    description: 'Your everyday pair, with a twist.',
    details: 'Handcrafted in 100% leather, the Classic sneaker features clean lines, a soft leather lining, and 100% rubber soles for all-day comfort. A stitched X-heart embroidery on the toe adds a playful touch, while our signature mismatched soles make it unmistakably NoMatch.',
    images: [
      'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'https://images.pexels.com/photos/2529147/pexels-photo-2529147.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'https://images.pexels.com/photos/1598508/pexels-photo-1598508.jpeg?auto=compress&cs=tinysrgb&w=1200',
    ],
  },
  {
    id: 'bloom-color-changing',
    name: 'Bloom (Color Changing)',
    price: '$230',
    sku: '01-002-M-BL',
    category: 'Shoes',
    description: 'Watch your sneakers transform in the sunlight.',
    details: 'The Bloom features our innovative UV-activated embroidery that changes color in sunlight. Handcrafted with premium leather and mismatched soles, these sneakers are designed to stand out.',
    images: [
      'https://images.pexels.com/photos/2529147/pexels-photo-2529147.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'https://images.pexels.com/photos/1598508/pexels-photo-1598508.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=1200',
    ],
  },
  {
    id: 'bloom-silver',
    name: 'Bloom Silver (Color Changing)',
    price: '$240',
    sku: '01-003-M-BS',
    category: 'Shoes',
    description: 'Premium silver edition with UV-activated floral patterns.',
    details: 'The Bloom Silver features our innovative UV-activated embroidery with metallic silver accents. Handcrafted with premium leather and mismatched soles.',
    images: [
      'https://images.pexels.com/photos/2529146/pexels-photo-2529146.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'https://images.pexels.com/photos/1598509/pexels-photo-1598509.jpeg?auto=compress&cs=tinysrgb&w=1200',
    ],
  },
  {
    id: 'daisy-dream-silver',
    name: 'Daisy dream Silver (Color Changing)',
    price: '$240',
    sku: '01-004-M-DS',
    category: 'Shoes',
    description: 'Elegant daisy patterns that change with sunlight.',
    details: 'The Daisy dream Silver features delicate daisy embroidery with UV-activated technology and premium silver accents.',
    images: [
      'https://images.pexels.com/photos/3261069/pexels-photo-3261069.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=1200',
    ],
  },
  {
    id: 'daisy-dream',
    name: 'Daisy dream(Color Changing)',
    price: '$230',
    sku: '01-005-M-DD',
    category: 'Shoes',
    description: 'Classic daisy patterns with color-changing magic.',
    details: 'The Daisy dream features charming daisy embroidery that comes alive in sunlight with UV-activated technology.',
    images: [
      'https://images.pexels.com/photos/1598506/pexels-photo-1598506.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'https://images.pexels.com/photos/1478442/pexels-photo-1478442.jpeg?auto=compress&cs=tinysrgb&w=1200',
    ],
  },
  {
    id: 'floral-snake',
    name: 'Floral snake',
    price: '$220',
    sku: '01-006-M-FS',
    category: 'Shoes',
    description: 'Playful floral design meets bold statement.',
    details: 'The Floral snake features unique floral embroidery with our signature mismatched design. Handcrafted with 100% leather and comfortable rubber soles.',
    images: [
      'https://images.pexels.com/photos/1460838/pexels-photo-1460838.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'https://images.pexels.com/photos/1456706/pexels-photo-1456706.jpeg?auto=compress&cs=tinysrgb&w=1200',
    ],
  },
  {
    id: 'graffiti',
    name: 'Graffiti',
    price: '$220',
    sku: '01-007-M-GR',
    category: 'Shoes',
    description: 'Urban art meets premium craftsmanship.',
    details: 'Our Graffiti collection features bold patterns for those who dare to stand out. Handmade with premium materials for lasting comfort and style.',
    images: [
      'https://images.pexels.com/photos/2048548/pexels-photo-2048548.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'https://images.pexels.com/photos/2300334/pexels-photo-2300334.jpeg?auto=compress&cs=tinysrgb&w=1200',
    ],
  },
  {
    id: 'graffiti-color-changing',
    name: 'Graffiti (Color Changing)',
    price: '$230',
    sku: '01-008-M-GC',
    category: 'Shoes',
    description: 'Bold design that changes with the light.',
    details: 'Our Graffiti collection features bold patterns and UV-activated colors. Each pair is handmade with premium materials for lasting comfort and style.',
    images: [
      'https://images.pexels.com/photos/3076787/pexels-photo-3076787.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'https://images.pexels.com/photos/3189024/pexels-photo-3189024.jpeg?auto=compress&cs=tinysrgb&w=1200',
    ],
  },
  {
    id: 'graffiti-silver',
    name: 'Graffiti Silver',
    price: '$240',
    sku: '01-009-M-GS',
    category: 'Shoes',
    description: 'Premium graffiti design with silver accents.',
    details: 'The Graffiti Silver features bold urban art patterns with premium metallic silver accents for an elevated streetwear look.',
    images: [
      'https://images.pexels.com/photos/2300333/pexels-photo-2300333.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'https://images.pexels.com/photos/1032110/pexels-photo-1032110.jpeg?auto=compress&cs=tinysrgb&w=1200',
    ],
  },
  {
    id: 'monogram-bold',
    name: 'Monogram Bold',
    price: '$220',
    sku: '01-010-M-MB',
    category: 'Shoes',
    description: 'Bold monogram pattern for a statement look.',
    details: 'Our Monogram Bold features a striking pattern of signature symbols. Handcrafted with premium leather for comfort and durability.',
    images: [
      'https://images.pexels.com/photos/2529159/pexels-photo-2529159.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'https://images.pexels.com/photos/1456713/pexels-photo-1456713.jpeg?auto=compress&cs=tinysrgb&w=1200',
    ],
  },
  {
    id: 'monogram-metallic',
    name: 'Monogram Metallic (Color Changing)',
    price: '$230',
    sku: '01-011-M-MM',
    category: 'Shoes',
    description: 'Metallic monogram with UV-activated color-changing effects.',
    details: 'The Monogram Metallic combines bold patterns with UV-activated technology and metallic finishes for a truly unique look.',
    images: [
      'https://images.pexels.com/photos/2760241/pexels-photo-2760241.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'https://images.pexels.com/photos/2300335/pexels-photo-2300335.jpeg?auto=compress&cs=tinysrgb&w=1200',
    ],
  },
  {
    id: 'good-luck',
    name: 'Good luck',
    price: '$220',
    sku: '01-012-M-GL',
    category: 'Shoes',
    description: 'Lucky charms pattern for good vibes.',
    details: 'The Good luck features playful lucky charm embroidery designed to bring positive energy to every step.',
    images: [
      'https://images.pexels.com/photos/2529153/pexels-photo-2529153.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'https://images.pexels.com/photos/1456715/pexels-photo-1456715.jpeg?auto=compress&cs=tinysrgb&w=1200',
    ],
  },
  {
    id: 'xoxo-color-changing',
    name: 'XOXO (Color Changing)',
    price: '$240',
    sku: '01-013-M-XO',
    category: 'Shoes',
    description: 'Playful XOXO design with UV-activated color effects.',
    details: 'Express love and affection with our XOXO design featuring UV-activated embroidery that transforms in sunlight.',
    images: [
      'https://images.pexels.com/photos/1598508/pexels-photo-1598508.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'https://images.pexels.com/photos/2529147/pexels-photo-2529147.jpeg?auto=compress&cs=tinysrgb&w=1200',
    ],
  },
  {
    id: 'graffiti-pink',
    name: 'Graffiti Pink',
    price: '$240',
    sku: '01-014-M-GP',
    category: 'Shoes',
    description: 'Pink graffiti design with bold attitude.',
    details: 'The Graffiti Pink brings urban edge to a feminine colorway, featuring bold patterns on a vibrant pink canvas.',
    images: [
      'https://images.pexels.com/photos/1456706/pexels-photo-1456706.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'https://images.pexels.com/photos/1460838/pexels-photo-1460838.jpeg?auto=compress&cs=tinysrgb&w=1200',
    ],
  },
  {
    id: 'love-color-changing',
    name: 'LOVE (Color Changing)',
    price: '$230',
    sku: '01-015-M-LV',
    category: 'Shoes',
    description: 'Spread love with UV-activated color-changing design.',
    details: 'The LOVE design features heartfelt embroidery with UV-activated technology that reveals hidden colors in sunlight.',
    images: [
      'https://images.pexels.com/photos/2300334/pexels-photo-2300334.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'https://images.pexels.com/photos/2048548/pexels-photo-2048548.jpeg?auto=compress&cs=tinysrgb&w=1200',
    ],
  },
  {
    id: 'text-me-color-changing',
    name: 'Text me (Color Changing)',
    price: '$230',
    sku: '01-016-M-TM',
    category: 'Shoes',
    description: 'Fun text pattern with UV-activated colors.',
    details: 'The Text me features playful typography embroidery with UV-activated colors that change in the sun for a dynamic look.',
    images: [
      'https://images.pexels.com/photos/3261069/pexels-photo-3261069.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=1200',
    ],
  },
  {
    id: 'pillow-wedge-limited',
    name: 'Pillow Wedge – Limited Edition',
    price: '$250',
    sku: '01-017-M-PW',
    category: 'Shoes',
    description: 'Limited edition pillow wedge for ultimate comfort and style.',
    details: 'Our exclusive Pillow Wedge combines elevated platform style with cloud-like comfort. Limited quantities available.',
    images: [
      'https://images.pexels.com/photos/1478442/pexels-photo-1478442.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'https://images.pexels.com/photos/1598506/pexels-photo-1598506.jpeg?auto=compress&cs=tinysrgb&w=1200',
    ],
  },
  // Accessories
  {
    id: 'gold-signature-charm',
    name: 'Gold Signature Charm',
    price: '$20',
    sku: 'A06GD',
    category: 'Accessories',
    categories: ['Accessories', 'Charm'],
    description: 'Stainless steel charms plated in gold and silver. Add them to your sneakers, necklace, or bracelet for a personalized NoMatch touch.',
    details: 'Add a personalized touch to your NoMatch sneakers with our shoelace charms. Designed to accessorize and elevate your unique look, these charms are crafted for durability and style, ensuring your shoes stand out in every step.',
    material: '100% Stainless Steel',
    finish: 'Gold or Silver Plated',
    features: 'Waterproof and durable',
    compatibility: 'Perfect fit for NoMatch sneakers',
    images: [
      'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'https://images.pexels.com/photos/1457841/pexels-photo-1457841.jpeg?auto=compress&cs=tinysrgb&w=1200',
    ],
  },
  {
    id: 'silver-signature-charm',
    name: 'Silver Signature Charm',
    price: '$15',
    sku: 'A06SV',
    category: 'Accessories',
    categories: ['Accessories', 'Charm'],
    description: 'Stainless steel charms plated in silver. Add them to your sneakers, necklace, or bracelet for a personalized NoMatch touch.',
    details: 'Add a personalized touch to your NoMatch sneakers with our shoelace charms. Designed to accessorize and elevate your unique look, these charms are crafted for durability and style, ensuring your shoes stand out in every step.',
    material: '100% Stainless Steel',
    finish: 'Gold or Silver Plated',
    features: 'Waterproof and durable',
    compatibility: 'Perfect fit for NoMatch sneakers',
    images: [
      'https://images.pexels.com/photos/1457843/pexels-photo-1457843.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'https://images.pexels.com/photos/1457840/pexels-photo-1457840.jpeg?auto=compress&cs=tinysrgb&w=1200',
    ],
  },
  // Clothing
  {
    id: 'bloom-cap-pink',
    name: 'Bloom UV-Activated Cap in Light Pink',
    price: '$38',
    sku: 'CAP-BLM-PK',
    category: 'Clothing',
    description: 'A cap that blooms in the sun.',
    details: 'The Bloom UV-Activated Cap in Light Pink features soft, flexible fabric, premium embroidery, and color-changing flowers that shift from white to pink — unique, sporty, and perfectly NoMatch.',
    images: [
      'https://images.pexels.com/photos/1124468/pexels-photo-1124468.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'https://images.pexels.com/photos/1124465/pexels-photo-1124465.jpeg?auto=compress&cs=tinysrgb&w=1200',
    ],
  },
  {
    id: 'daisy-cap-yellow',
    name: 'Daisy Dreams UV Activated Cap in Yellow',
    price: '$38',
    sku: 'CAP-DSY-YL',
    category: 'Clothing',
    description: 'Watch your daisies come to life in the sun.',
    details: 'The Daisys UV-Activated Cap in Yellow features soft, flexible fabric, premium embroidery, and color-changing details that appear in sunlight — sporty, playful, and perfectly NoMatch.',
    images: [
      'https://images.pexels.com/photos/984619/pexels-photo-984619.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'https://images.pexels.com/photos/984620/pexels-photo-984620.jpeg?auto=compress&cs=tinysrgb&w=1200',
    ],
  },
  {
    id: 'signature-cap-dark-pink',
    name: 'Signature "Made to NoMatch" UV-Activated Cap in Dark Pink',
    price: '$38',
    sku: 'CAP-SIG-DPK',
    category: 'Clothing',
    description: 'Stand out in our Signature "Made to NoMatch" UV-Activated Cap in Dark Pink.',
    details: 'Featuring color-changing embroidery and our Made to NoMatch slogan on the side — soft, sporty, and perfectly you.',
    images: [
      'https://images.pexels.com/photos/1124466/pexels-photo-1124466.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'https://images.pexels.com/photos/1124467/pexels-photo-1124467.jpeg?auto=compress&cs=tinysrgb&w=1200',
    ],
  },
  {
    id: 'xoxo-cap-purple',
    name: 'XOXO UV-Activated Cap in Purple',
    price: '$38',
    sku: 'CAP-XO-PUR',
    category: 'Clothing',
    description: 'Step outside and watch the magic happen.',
    details: 'The XOXO UV-Activated Cap in Purple features color-changing embroidery that shifts from white details to bright pinks and purples — soft, sporty, and perfectly matched to your NoMatch sneakers.',
    images: [
      'https://images.pexels.com/photos/1646647/pexels-photo-1646647.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'https://images.pexels.com/photos/1646648/pexels-photo-1646648.jpeg?auto=compress&cs=tinysrgb&w=1200',
    ],
  },
  {
    id: 'graffiti-hoodie',
    name: 'NoMatch Graffiti Hoodie',
    price: '$60',
    sku: 'HOD-GRF',
    category: 'Clothing',
    subcategory: 'Hoodie',
    description: 'Stand out in comfort.',
    details: 'This 100% cotton hoodie features our signature graffiti puff print sleeve—bold, playful, and unmistakably NoMatch.',
    images: [
      'https://images.pexels.com/photos/3755706/pexels-photo-3755706.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'https://images.pexels.com/photos/3755707/pexels-photo-3755707.jpeg?auto=compress&cs=tinysrgb&w=1200',
    ],
  },
  {
    id: 'pink-signature-hoodie',
    name: 'NoMatch Pink Signature Hoodie',
    price: '$60',
    sku: 'HOD-SIG-PK',
    category: 'Clothing',
    subcategory: 'Hoodie',
    description: 'The iconic pink signature hoodie—where comfort meets statement style.',
    details: 'Made to match your sneakers (or not).',
    images: [
      'https://images.pexels.com/photos/3755708/pexels-photo-3755708.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'https://images.pexels.com/photos/3755709/pexels-photo-3755709.jpeg?auto=compress&cs=tinysrgb&w=1200',
    ],
  },
];

export default function ProductDetail() {
  const { productId } = useParams();
  const { addToCart } = useCart();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('details');
  const [product, setProduct] = useState<ProductInventory | null>(null);
  const [loading, setLoading] = useState(true);
  const [stockInfo, setStockInfo] = useState<{ [key: string]: number }>({});

  // Fetch product from Firestore
  useEffect(() => {
    const loadProduct = async () => {
      if (!productId) return;
      
      try {
        const firestoreProduct = await getProduct(productId);
        if (firestoreProduct) {
          setProduct(firestoreProduct);
          
          // Load stock info
          if (firestoreProduct.sizes) {
            setStockInfo(firestoreProduct.sizes);
          } else if (firestoreProduct.stock !== undefined) {
            setStockInfo({ general: firestoreProduct.stock });
          }
        } else {
          // Fallback to hardcoded product
          const fallback = fallbackProducts.find(p => p.id === productId);
          if (fallback) {
            setProduct(fallback as any);
          }
        }
      } catch (error) {
        console.error('Error loading product:', error);
        const fallback = fallbackProducts.find(p => p.id === productId);
        if (fallback) {
          setProduct(fallback as any);
        }
      } finally {
        setLoading(false);
      }
    };
    
    loadProduct();
  }, [productId]);

  // Track product view
  useEffect(() => {
    if (product) {
      trackEvent('product_view', { 
        productId: product.id,
        productName: product.name,
        category: product.category,
        price: product.price
      });
    }
  }, [product]);

  const handleAddToCart = () => {
    if (!product) return;
    
    // For shoes and sized clothing, require size selection
    if ((product.category === 'Shoes' || (product.category === 'Clothing' && product.subcategory === 'Hoodie')) && !selectedSize) {
      alert('Please select a size');
      return;
    }

    // Check stock availability
    if (selectedSize) {
      const stock = stockInfo[selectedSize] || 0;
      if (stock === 0) {
        alert('This size is out of stock');
        return;
      }
      if (quantity > stock) {
        alert(`Only ${stock} items available for this size`);
        return;
      }
    } else {
      const stock = stockInfo.general || 0;
      if (stock === 0) {
        alert('This item is out of stock');
        return;
      }
      if (quantity > stock) {
        alert(`Only ${stock} items available`);
        return;
      }
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      size: selectedSize || undefined,
      category: product.category,
      quantity: quantity,
    });
  };

  const shoeSizes = ['6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11'];
  const clothingSizes = ['XS', 'S', 'M', 'L'];

  const nextImage = () => {
    if (!product) return;
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    if (!product) return;
    setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  const getSizeStock = (size: string) => {
    return stockInfo[size] || 0;
  };

  const isOutOfStock = () => {
    if (product?.category === 'Shoes' || (product?.category === 'Clothing' && product?.subcategory === 'Hoodie')) {
      return Object.values(stockInfo).every(qty => qty === 0);
    }
    return (stockInfo.general || 0) === 0;
  };

  const isSizeOutOfStock = (size: string) => {
    return getSizeStock(size) === 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
          <Link 
            to="/shop" 
            className="inline-block px-8 py-3 bg-purple-600 text-white hover:bg-purple-700 transition-all duration-300 font-medium tracking-wider text-sm"
          >
            BACK TO SHOP
          </Link>
        </div>
      </div>
    );
  }

  const relatedProducts = fallbackProducts.filter(p => p.id !== product.id).slice(0, 3);

  return (
    <div className="min-h-screen bg-pink-50">
      {/* Breadcrumb */}
      <div className="container mx-auto px-6 py-6">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Link to="/" className="hover:text-purple-600">Home</Link>
          <span>›</span>
          {product.category === 'Accessories' && (
            <>
              <Link to="/shop/accessories" className="hover:text-purple-600">Accessories</Link>
              <span>›</span>
              {product.categories && product.categories.length > 1 && (
                <>
                  <span className="hover:text-purple-600">{product.categories[1]}</span>
                  <span>›</span>
                </>
              )}
            </>
          )}
          {product.category === 'Clothing' && (
            <>
              <Link to="/shop/clothing" className="hover:text-purple-600">Clothing</Link>
              <span>›</span>
            </>
          )}
          {product.category === 'Shoes' && (
            <>
              <Link to="/shop/shoes" className="hover:text-purple-600">Shoes</Link>
              <span>›</span>
            </>
          )}
          <span className="text-gray-900">{product.name}</span>
        </div>
      </div>

      {/* Product Section */}
      <div className="container mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left - Images */}
          <div>
            {/* Main Image */}
            <div className="relative bg-white rounded-lg overflow-hidden mb-4 aspect-square">
              <img
                src={product.images[currentImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center transition-all shadow-lg"
                  >
                    <ChevronLeft className="w-6 h-6 text-gray-800" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center transition-all shadow-lg"
                  >
                    <ChevronRight className="w-6 h-6 text-gray-800" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Gallery */}
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`relative aspect-square bg-white rounded-lg overflow-hidden border-2 transition-all ${
                    currentImageIndex === index ? 'border-purple-600' : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <img src={image} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Right - Product Info */}
          <div>
            <h1 className="text-4xl font-serif text-gray-900 mb-4" style={{ fontFamily: 'Georgia, serif' }}>
              {product.name}
            </h1>
            <p className="text-2xl text-purple-600 font-medium mb-6">{product.price}</p>

            <div className="mb-8">
              <p className="text-base text-gray-900 font-bold mb-3">
                {product.description}
              </p>
              <p className="text-base text-gray-700 leading-relaxed" style={{ fontWeight: 400 }}>
                {product.details}
              </p>
            </div>

            {/* Out of Stock Warning */}
            {isOutOfStock() && (
              <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-900 mb-1">Out of Stock</p>
                  <p className="text-sm text-red-700">This product is currently unavailable. Check back later or contact us for more information.</p>
                </div>
              </div>
            )}

            {/* Size Selector - For Shoes and Clothing */}
            {(product.category === 'Shoes' || (product.category === 'Clothing' && product.subcategory === 'Hoodie')) && (
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-900 mb-3">Size:</label>
                <div className={`grid gap-2 ${product.category === 'Shoes' ? 'grid-cols-3 sm:grid-cols-4 md:grid-cols-6' : 'grid-cols-4'}`}>
                  {(product.category === 'Shoes' ? shoeSizes : clothingSizes).map((size) => {
                    const sizeStock = getSizeStock(size);
                    const outOfStock = isSizeOutOfStock(size);
                    
                    return (
                      <button
                        key={size}
                        onClick={() => !outOfStock && setSelectedSize(size)}
                        disabled={outOfStock}
                        className={`relative px-4 py-3 border rounded font-medium transition-all ${
                          outOfStock
                            ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                            : selectedSize === size
                            ? 'border-pink-400 bg-pink-50 text-pink-600'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-pink-300 hover:bg-pink-50'
                        }`}
                        title={outOfStock ? 'Out of stock' : `${sizeStock} in stock`}
                      >
                        {product.category === 'Shoes' ? `US ${size}` : size}
                        {outOfStock && (
                          <span className="absolute top-0 right-0 bg-red-500 text-white text-[8px] px-1 rounded-bl rounded-tr">
                            OUT
                          </span>
                        )}
                        {!outOfStock && sizeStock < 5 && sizeStock > 0 && (
                          <span className="absolute bottom-0 right-0 bg-yellow-500 text-white text-[8px] px-1 rounded-tl rounded-br">
                            {sizeStock}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                {selectedSize && !isSizeOutOfStock(selectedSize) && (
                  <p className="mt-2 text-sm text-green-600">
                    ✓ {getSizeStock(selectedSize)} available in size {product.category === 'Shoes' ? `US ${selectedSize}` : selectedSize}
                  </p>
                )}
              </div>
            )}

            {/* Stock Info for non-shoes */}
            {product.category !== 'Shoes' && (stockInfo.general || 0) > 0 && (stockInfo.general || 0) < 10 && (
              <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  ⚠️ Only {stockInfo.general} left in stock
                </p>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center border-2 border-gray-300 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 hover:bg-gray-100 transition-colors"
                >
                  −
                </button>
                <span className="px-6 py-2 font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 hover:bg-gray-100 transition-colors"
                >
                  +
                </button>
              </div>

              <button 
                onClick={handleAddToCart}
                disabled={isOutOfStock()}
                className={`flex-1 px-8 py-3 font-semibold rounded-lg transition-colors shadow-md ${
                  isOutOfStock()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-pink-500 text-white hover:bg-pink-600 hover:shadow-lg'
                }`}
              >
                {isOutOfStock() ? 'OUT OF STOCK' : 'ADD TO CART'}
              </button>
            </div>

            {/* Shipping Info */}
            <div className="space-y-3 border-t border-gray-200 pt-6">
              <div className="flex items-center gap-3 text-gray-700">
                <Package className="w-5 h-5 text-purple-600" />
                <span>Free domestic shipping on all orders</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <Clock className="w-5 h-5 text-purple-600" />
                <span>Delivers in 3-5 Business Days</span>
              </div>
            </div>

            {/* SKU and Category */}
            <div className="mt-6 pt-6 border-t border-gray-200 text-sm text-gray-600">
              <p>SKU: {product.sku}</p>
              <p>
                {product.categories ? `Categories: ${product.categories.join(', ')}` : `Category: ${product.category}`}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-16">
          <div className="flex justify-center gap-12 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('details')}
              className={`pb-4 text-lg font-medium transition-colors relative ${
                activeTab === 'details' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Description
              {activeTab === 'details' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('shipping')}
              className={`pb-4 text-lg font-medium transition-colors relative ${
                activeTab === 'shipping' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Shipping & Returns
              {activeTab === 'shipping' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-4 text-lg font-medium transition-colors relative ${
                activeTab === 'reviews' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Reviews (0)
              {activeTab === 'reviews' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"></div>
              )}
            </button>
          </div>

          {/* Tab Content */}
          <div className="mt-12 max-w-4xl">
            {activeTab === 'details' && (
              <div className="space-y-6 text-gray-700">
                {product.category === 'Shoes' ? (
                  <>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-3">Product Details</h3>
                      <ul className="space-y-2 text-gray-700">
                        <li><strong>Upper:</strong> 100% Leather</li>
                        <li><strong>Lining:</strong> 100% Leather</li>
                        <li><strong>Outsole:</strong> 100% Rubber</li>
                        <li><strong>Craftsmanship:</strong> Handmade with love in Mexico</li>
                        <li><strong>Fit:</strong> Standard</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-3">Description</h3>
                      <p className="leading-relaxed text-gray-700">
                        Our signature collection showcases premium craftsmanship with materials designed for both comfort and durability. Our embroidered sneakers are made with 100% leather, both inside and out. Our soles are made with 100% rubber for long-lasting wear. Experience immediate comfort with soft leather that requires no break-in period, allowing you to enjoy your NoMatch sneakers right out of the box. Each pair is uniquely handcrafted to reflect individual style, embracing the spirit of NoMatch where no two pairs are the same. Expect individual differences in details and patterns such as sole colors, laces, and embroidery, making every pair one-of-a-kind. Personalize your sneakers by selecting unique laces and charms to make your NoMatch pair truly yours.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-3">Charms</h3>
                      <p className="leading-relaxed text-gray-700">
                        The added charms are made from 100% stainless steel and plated in silver or gold. Perfect for adding a unique touch to your sneakers, or wear them as a stylish necklace or bracelet!
                      </p>
                    </div>
                  </>
                ) : product.category === 'Accessories' ? (
                  <>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-3">Specifications</h3>
                      <ul className="space-y-2 text-gray-700">
                        <li><strong>Material:</strong> {product.material || '100% Stainless Steel'}</li>
                        <li><strong>Finish:</strong> {product.finish || 'Gold or Silver Plated'}</li>
                        <li><strong>Features:</strong> {product.features || 'Waterproof and durable'}</li>
                        <li><strong>Compatibility:</strong> {product.compatibility || 'Perfect fit for NoMatch sneakers'}</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-3">Description</h3>
                      <p className="leading-relaxed text-gray-700">
                        {product.details}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-3">Description</h3>
                      <p className="leading-relaxed text-gray-700">
                        {product.details}
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="space-y-8 text-gray-700">
                <div>
                  <h3 className="font-bold text-gray-900 mb-4">Shipping</h3>
                  <ul className="space-y-3 list-disc pl-5 text-gray-700">
                    <li>Enjoy complimentary shipping on all domestic orders over $300.</li>
                    <li>Express delivery available, with an estimated arrival of 3-4 business days.</li>
                    <li>Track your shipment <a href="#" className="text-purple-600 underline">here</a>.</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-4">Returns</h3>
                  <ul className="space-y-3 list-disc pl-5 text-gray-700">
                    <li>We offer free domestic returns for a full refund on items postmarked within 10 days of delivery.</li>
                    <li>Items must be returned in their original condition: unwashed, unworn, and with tags attached. Footwear must be unused, in the original packaging, and in re-sellable conditions (no creases or wear). Complimentary items must be returned with the original purchase.</li>
                    <li>To ensure eligibility for return, please try on footwear on a carpeted surface or indoors to avoid sole wear.</li>
                    <li>We reserve the right to refuse returns that do not meet these criteria.</li>
                    <li>Returns postmarked beyond 10 days will not be accepted.</li>
                    <li>All items purchased on sale are considered <em>FINAL SALE</em> and are not eligible for return or exchange.</li>
                    <li>Free exchanges are available within 20 days of delivery for unworn items or footwear.</li>
                    <li>Note: Certain items, including hats, charms, and individually purchased accessories such as laces, are not eligible for return.</li>
                  </ul>
                </div>
                <p className="italic text-gray-700">We appreciate your understanding and are committed to ensuring a seamless shopping experience.</p>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <h2 className="text-2xl font-serif font-medium text-gray-900 mb-6">Reviews</h2>
                <p className="text-gray-600 mb-6">There are no reviews yet.</p>
                <button className="px-8 py-3 bg-pink-500 text-white font-semibold rounded hover:bg-pink-600 transition-colors">
                  WRITE A REVIEW
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-20">
          <h2 className="text-4xl font-serif font-medium text-center text-gray-900 mb-12">
            Related Products
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {relatedProducts.map((relatedProduct) => (
              <Link
                key={relatedProduct.id}
                to={`/product/${relatedProduct.id}`}
                className="group cursor-pointer"
              >
                <div className="bg-white rounded-lg overflow-hidden mb-4 shadow-sm hover:shadow-xl transition-all duration-300">
                  <div className="relative aspect-square">
                    <img
                      src={relatedProduct.images[0]}
                      alt={relatedProduct.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">{relatedProduct.name}</h3>
                <p className="text-purple-600 font-semibold text-lg">{relatedProduct.price}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

