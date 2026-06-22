// Client-side mock API implementation replacing backend requests

// Mock Products Database
let mockProducts = [
  {
    id: 1,
    _id: "1",
    name: "Luxury Watch Collection",
    brand: "LIT Timepieces",
    price: 299.99,
    originalPrice: 399.99,
    discount: 25,
    description:
      "Exclusive collection of luxury watches featuring premium materials and precise craftsmanship. Each timepiece is designed to make a statement of elegance and sophistication.",
    image: "/images/men.png",
    imageUrl: "/images/men.png",
    category: "Accessories",
    colors: ["Gold", "Silver", "Rose Gold"],
    sizes: ["Standard"],
    stock: 15,
    rating: 4.8,
    reviews: 124,
    features: [
      "Premium stainless steel construction",
      "Swiss movement",
      "Sapphire crystal glass",
      "Water resistant up to 100m",
      "2-year warranty",
    ],
    featured: true,
  },
  {
    id: 2,
    _id: "2",
    name: "Designer Sunglasses",
    brand: "LIT Vision",
    price: 199.99,
    originalPrice: 249.99,
    discount: 20,
    description:
      "Stylish and protective sunglasses with UV400 protection. Perfect for both fashion and functionality, these sunglasses feature polarized lenses and premium frame materials.",
    image: "/images/men.png",
    imageUrl: "/images/men.png",
    category: "Accessories",
    colors: ["Black", "Brown", "Tortoise"],
    sizes: ["One Size"],
    stock: 25,
    rating: 4.6,
    reviews: 89,
    features: [
      "UV400 protection",
      "Polarized lenses",
      "Lightweight frame",
      "Includes protective case",
      "1-year warranty",
    ],
    featured: true,
  },
  {
    id: 3,
    _id: "3",
    name: "Premium Leather Wallet",
    brand: "LIT Essentials",
    price: 79.99,
    originalPrice: 99.99,
    discount: 20,
    description:
      "Handcrafted genuine leather wallet with multiple card slots and RFID protection. Perfect for everyday use while maintaining a luxurious appearance.",
    image: "/images/men.png",
    imageUrl: "/images/men.png",
    category: "Accessories",
    colors: ["Black", "Brown", "Tan"],
    sizes: ["Standard"],
    stock: 30,
    rating: 4.7,
    reviews: 156,
    features: [
      "Genuine leather",
      "RFID protection",
      "Multiple card slots",
      "Coin pocket",
      "Lifetime warranty",
    ],
    featured: false,
  },
  {
    id: 4,
    _id: "4",
    name: "Regular Fit Cashmere jumper",
    brand: "H&M",
    price: 3199,
    originalPrice: 7999,
    discount: 60,
    description:
      "A luxurious cashmere jumper with a regular fit. Made from 100% pure cashmere, this jumper offers exceptional softness and warmth.",
    image: "/images/men.png",
    imageUrl: "/images/men.png",
    category: "Clothing",
    colors: ["Black", "Beige", "Navy"],
    sizes: ["S", "M", "L", "XL"],
    stock: 50,
    rating: 4.5,
    reviews: 120,
    features: [
      "100% Pure Cashmere",
      "Regular Fit",
      "Machine washable",
      "Premium quality",
    ],
    featured: true,
  },
  {
    id: 5,
    _id: "5",
    name: "Regular Fit Cashmere jumper (Variant 2)",
    brand: "H&M",
    price: 3299,
    originalPrice: 8099,
    discount: 59,
    description:
      "Another luxurious cashmere jumper with slight variations in color options. Perfect for a sophisticated look.",
    image: "/images/men.png",
    imageUrl: "/images/men.png",
    category: "Clothing",
    colors: ["Grey", "White"],
    sizes: ["M", "L", "XL"],
    stock: 45,
    rating: 4.4,
    reviews: 110,
    features: [
      "Soft and breathable",
      "Durable stitching",
      "Easy care",
      "Versatile design",
    ],
    featured: false,
  },
  {
    id: 6,
    _id: "6",
    name: "Regular Fit Cashmere jumper (Variant 3)",
    brand: "H&M",
    price: 3099,
    originalPrice: 7899,
    discount: 61,
    description:
      "A third option for the cashmere jumper, offering different sizes and a classic appeal.",
    image: "/images/men.png",
    imageUrl: "/images/men.png",
    category: "Clothing",
    colors: ["Brown", "Blue"],
    sizes: ["S", "L", "XL", "XXL"],
    stock: 55,
    rating: 4.6,
    reviews: 130,
    features: [
      "High-quality cashmere blend",
      "Comfortable fit",
      "Fade resistant",
      "All-season wear",
    ],
    featured: false,
  },
];

// Mock Articles Database
let mockArticles = [
  {
    id: "art-1",
    _id: "art-1",
    slug: "sustainable-denim-revival",
    title: "The Sustainable Denim Revival",
    description:
      "Exploring eco-friendly denim manufacturing and its impact on the fashion industry.",
    bodyContent:
      "<p>Denim is a timeless staple, but its traditional production is resource-intensive. This article delves into the innovative brands and technologies making denim sustainable.</p>",
    imageUrl:
      "https://images.unsplash.com/photo-1593030103066-0424a66164a4?q=80&w=2070",
    category: "SustainableFashion",
    location: "Domestic",
    publishDate: "2024-06-15",
  },
  {
    id: "art-2",
    _id: "art-2",
    slug: "luxury-watch-trends-2024",
    title: "Luxury Watch Trends for 2024",
    description:
      "What to look for in high-end timepieces this year, from materials to movements.",
    bodyContent:
      "<p>From vintage revivals to cutting-edge complications, the world of luxury watches is ever-evolving. We explore the key trends collectors should watch for.</p>",
    imageUrl:
      "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=2080",
    category: "LuxuryFashion",
    location: "International",
    publishDate: "2024-06-12",
  },
  {
    id: "art-3",
    _id: "art-3",
    slug: "sneaker-culture-impact",
    title: "Sneaker Culture's Impact",
    description:
      "How sneakers transcended sportswear to become a multi-billion dollar cultural phenomenon.",
    bodyContent:
      "<p>This is placeholder content for the sneaker culture article. We explore how sneakers became a key component of modern luxury and fashion.</p>",
    imageUrl:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070",
    category: "SneakerWorld",
    location: "International",
    publishDate: "2024-06-10",
  },
  {
    id: "art-4",
    _id: "art-4",
    slug: "rise-of-streetwear-in-fast-fashion",
    title: "The Rise of Streetwear in Fast Fashion",
    description:
      "How streetwear aesthetics have reshaped modern fast-fashion retail lines.",
    bodyContent:
      "<p>Fast fashion brands are increasingly adopting streetwear collaborations and visual styles, responding to rapid shifts in younger consumers' daily wear preferences.</p>",
    imageUrl:
      "https://images.unsplash.com/photo-1509281373149-e957c6296406?q=80&w=2000",
    category: "FastFashion",
    location: "Domestic",
    publishDate: "2024-06-08",
  },
];

// Helper to delay response to simulate network latency if needed (disabled for max speed)
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ✅ Get all products
export const getProducts = async () => {
  await delay(100);
  return mockProducts;
};

// ✅ Get articles by category
export const getArticlesByCategory = async (category) => {
  await delay(100);
  return mockArticles.filter(
    (art) => art.category.toLowerCase() === category.toLowerCase(),
  );
};

// ✅ Get featured products
export const getFeaturedProducts = async () => {
  await delay(100);
  return mockProducts.filter((prod) => prod.featured);
};

// ✅ Get single product by ID
export const getProduct = async (id) => {
  await delay(100);
  const found = mockProducts.find(
    (prod) => String(prod.id) === String(id) || String(prod._id) === String(id),
  );
  if (!found) throw new Error("Product not found");
  return found;
};

// ✅ Create a new product
export const createProduct = async (productData) => {
  await delay(100);
  const newProduct = {
    ...productData,
    id: mockProducts.length + 1,
    _id: String(mockProducts.length + 1),
    rating: 5.0,
    reviews: 0,
    featured: false,
  };
  mockProducts.push(newProduct);
  return newProduct;
};

// ✅ Validate a coupon code
export const validateCouponCode = async (code) => {
  await delay(100);
  if (code.toUpperCase() === "SAVE10") {
    return {
      code: "SAVE10",
      discountType: "flat",
      discountValue: 100,
      active: true,
    };
  }
  throw new Error("Invalid or expired coupon code");
};

// ✅ Subscribe to newsletter
export const subscribeToNewsletter = async (email) => {
  await delay(100);
  return { message: "Subscribed successfully", email };
};

// ✅ Get all articles
export const getArticles = async () => {
  await delay(100);
  return mockArticles;
};

// ✅ Get article by slug
export const getArticleBySlug = async (slug) => {
  await delay(100);
  const found = mockArticles.find((art) => art.slug === slug);
  if (!found) throw new Error("Article not found");
  return found;
};

// ✅ Create or update user in DB
export const createUser = async (userData) => {
  await delay(100);
  return {
    message: "User logged in successfully (Mock)",
    user: {
      ...userData,
      _id: "mock-user-id-123",
      createdAt: new Date().toISOString(),
    },
  };
};
