// ============================================================
// LIT LUXURY MARKETPLACE — DATA LAYER
// All images served from /public/images/marketplace/ (no imports needed)
// ============================================================

// Hero Panels — use the 3 large fashion shoot images
const heroMen     = "/images/marketplace/hero-men.png";      // 3 men in suits (tropical)
const heroWomen   = "/images/marketplace/hero-women.png";    // Woman on sailing boat
const heroKids    = "/images/marketplace/hero-kids.png";     // Kid with sunglasses

// Flash Sale banner background
const flashSaleBg = "/images/marketplace/flash-sale-burberry.png"; // Couple jumping off boat

// Category split — men / women
const catMen      = "/images/marketplace/category-men.jpg";   // Man kicking ball
const catWomen    = "/images/marketplace/category-women.jpg"; // Woman at dock

// Products carousel (6 items)
const prodPradaBag       = "/images/marketplace/product-prada-bag.jpg";
const prodGucciLoafer    = "/images/marketplace/product-gucci-loafer.jpg";
const prodYslSunglasses  = "/images/marketplace/product-ysl-sunglasses.jpg";
const prodBossWatch      = "/images/marketplace/product-boss-watch.jpg";
const prodBurberryBag    = "/images/marketplace/product-burberry-bag.jpg";
const prodValentinoSandal= "/images/marketplace/product-valentino-sandal.jpg";

// Discover More cards (editorial lifestyle)
const discoverNewArrivals = "/images/marketplace/discover-new-arrivals.jpg"; // beige blazer
const discoverBestsellers = "/images/marketplace/discover-bestsellers.jpg";  // brown leather bag
const discoverTrending    = "/images/marketplace/discover-trending.jpg";     // man in brown suit
const discoverClearance   = "/images/marketplace/discover-clearance.jpg";    // woman in leather jacket

// ============================================================

export const LUXURY_ASSETS = {
  logo: null, // logo will be uploaded by the user — left blank intentionally
  hero: { men: heroMen, women: heroWomen, kids: heroKids },
  flashSaleBg,
  categories: { men: catMen, women: catWomen },
  // Brand logos rendered as typography — no image files
  brands: [
    { name: "PRADA",        style: "font-bold tracking-[0.2em]",                slug: "prada" },
    { name: "GUCCI",        style: "font-light tracking-[0.35em]",              slug: "gucci" },
    { name: "BURBERRY",     style: "font-bold tracking-[0.12em]",               slug: "burberry" },
    { name: "FERRAGAMO",    style: "font-bold tracking-[0.08em]",               slug: "ferragamo" },
    { name: "BOSS",         style: "font-black tracking-[0.06em]",              slug: "boss", sub: "HUGO BOSS" },
    { name: "VALENTINO",    style: "font-light tracking-[0.18em]",              slug: "valentino" },
    { name: "SAINT LAURENT",style: "font-bold tracking-[0.08em]",               slug: "saint-laurent" },
  ],
};

export const LUXURY_HERO_PANELS = [
  { id: "men",   title: "MEN",   image: heroMen,   ctaText: "SHOP NOW →", link: "/shop/products?gender=men" },
  { id: "women", title: "WOMEN", image: heroWomen, ctaText: "SHOP NOW →", link: "/shop/products?gender=women" },
  { id: "kids",  title: "KIDS",  image: heroKids,  ctaText: "SHOP NOW →", link: "/shop/products?kids=true" },
];

export const TRUST_BENEFITS = [
  { id: "authenticated",  iconType: "shield",   title: "AUTHENTICATED",  desc: "Every piece verified for your peace of mind." },
  { id: "curated",        iconType: "diamond",  title: "CURATED",        desc: "Handpicked pieces with intention." },
  { id: "fairly-priced",  iconType: "tag",      title: "FAIRLY PRICED",  desc: "Luxury at considered prices." },
  { id: "secure-delivery",iconType: "truck",    title: "SECURE DELIVERY",desc: "From our hands to yours." },
];

export const LUXURY_PRODUCTS = [
  {
    id: 1,
    slug: "prada-re-nylon-shoulder-bag",
    brand: "PRADA",
    name: "Re-Nylon Shoulder Bag",
    price: 34250,
    originalPrice: 64900,
    discount: "47% OFF",
    image: prodPradaBag,
    category: "bags",
    gender: "women",
    authenticated: true,
    stock: 4,
    description: "Crafted from signature recycled nylon yarn with brushed leather accents, signature enameled triangle logo, and adjustable strap.",
    sizes: ["One Size"],
    colors: ["Black"],
  },
  {
    id: 2,
    slug: "gucci-horsebit-loafer",
    brand: "GUCCI",
    name: "Horsebit Loafer",
    price: 48960,
    originalPrice: 79000,
    discount: "38% OFF",
    image: prodGucciLoafer,
    category: "shoes",
    gender: "men",
    authenticated: true,
    stock: 6,
    description: "The classic 1953 Horsebit loafer in polished black calf leather with burnished gold-tone hardware and Blake welt construction.",
    sizes: ["UK 7", "UK 8", "UK 9", "UK 10"],
    colors: ["Black"],
  },
  {
    id: 3,
    slug: "saint-laurent-sl-617-new-wave",
    brand: "SAINT LAURENT",
    name: "SL 617 New Wave",
    price: 20150,
    originalPrice: 31000,
    discount: "35% OFF",
    image: prodYslSunglasses,
    category: "accessories",
    gender: "unisex",
    authenticated: true,
    stock: 8,
    description: "Angular acetate frame sunglasses featuring 100% UVA/UVB protection and subtle laser-engraved Saint Laurent signature along the temples.",
    sizes: ["Standard"],
    colors: ["Black Smoke"],
  },
  {
    id: 4,
    slug: "boss-chronograph-watch",
    brand: "BOSS",
    name: "Chronograph Watch",
    price: 15600,
    originalPrice: 24000,
    discount: "35% OFF",
    image: prodBossWatch,
    category: "accessories",
    gender: "men",
    authenticated: true,
    stock: 5,
    description: "Precision quartz movement chronograph featuring a tachymeter bezel, multi-dial display, mineral crystal glass, and textured black silicone strap.",
    sizes: ["44mm"],
    colors: ["Black/Gold"],
  },
  {
    id: 5,
    slug: "burberry-tb-shoulder-bag",
    brand: "BURBERRY",
    name: "TB Shoulder Bag",
    price: 81250,
    originalPrice: 135000,
    discount: "40% OFF",
    image: prodBurberryBag,
    category: "bags",
    gender: "women",
    authenticated: true,
    stock: 3,
    description: "Structured shoulder bag in smooth calfskin adorned with the Thomas Burberry monogram clasp in polished gold-plated metal.",
    sizes: ["Small", "Medium"],
    colors: ["Black"],
  },
  {
    id: 6,
    slug: "valentino-rockstud-sandal",
    brand: "VALENTINO",
    name: "Rockstud Sandal",
    price: 35900,
    originalPrice: 69900,
    discount: "48% OFF",
    image: prodValentinoSandal,
    category: "shoes",
    gender: "women",
    authenticated: true,
    stock: 5,
    description: "Iconic cage-strap pump in beige nappa leather embellished with platinum-finish signature pyramid studs and adjustable buckle straps.",
    sizes: ["EU 36", "EU 37", "EU 38", "EU 39"],
    colors: ["Poudre Beige"],
  },
];

export const CATEGORY_SPLIT_DATA = {
  men: {
    title: "MEN",
    image: catMen,
    links: [
      { name: "BAGS",        path: "/shop/products?gender=men&category=bags" },
      { name: "SHOES",       path: "/shop/products?gender=men&category=shoes" },
      { name: "CLOTHING",    path: "/shop/products?gender=men&category=clothing" },
      { name: "ACCESSORIES", path: "/shop/products?gender=men&category=accessories" },
    ],
    exploreLink: "/shop/products?gender=men",
  },
  women: {
    title: "WOMEN",
    image: catWomen,
    links: [
      { name: "BAGS",        path: "/shop/products?gender=women&category=bags" },
      { name: "SHOES",       path: "/shop/products?gender=women&category=shoes" },
      { name: "CLOTHING",    path: "/shop/products?gender=women&category=clothing" },
      { name: "ACCESSORIES", path: "/shop/products?gender=women&category=accessories" },
    ],
    exploreLink: "/shop/products?gender=women",
  },
};

export const DISCOVER_MORE_CARDS = [
  { id: "new-arrivals", title: "NEW ARRIVALS",  desc: "Fresh pieces, just in.",            image: discoverNewArrivals, link: "/shop/products?sort=newest",       cta: "SHOP NOW →" },
  { id: "bestsellers",  title: "BESTSELLERS",   desc: "The most loved right now.",         image: discoverBestsellers, link: "/shop/products?sort=best-selling",  cta: "SHOP NOW →" },
  { id: "trending-now", title: "TRENDING NOW",  desc: "What's capturing everyone's eye.",  image: discoverTrending,   link: "/shop/products?featured=true",     cta: "SHOP NOW →" },
  { id: "clearance",    title: "CLEARANCE",     desc: "Iconic pieces, exclusive prices.",  image: discoverClearance,  link: "/shop/products?clearance=true",    cta: "SHOP NOW →" },
];

export const AUTHENTICITY_STEPS = [
  { id: "verified",   iconType: "shield",  title: "VERIFIED",   desc: "Every product undergoes rigorous authentication." },
  { id: "inspected",  iconType: "search",  title: "INSPECTED",  desc: "Detailed checks for quality and condition." },
  { id: "documented", iconType: "file",    title: "DOCUMENTED", desc: "Product condition recorded before dispatch." },
];

export const LIT_GAME_DATA = [
  {
    id: 1,
    question: "Which One Looks More Expensive?",
    subtitle: "Two pieces. One question. You decide.",
    itemA: {
      brand: "PRADA",
      name: "Re-Nylon Shoulder Bag",
      price: 34250,
      image: prodPradaBag,
      isAuthentic: true,
      description: "Authentic Milanese craftsmanship & luxury recycled nylon.",
    },
    itemB: {
      brand: "BURBERRY",
      name: "TB Shoulder Bag",
      price: 81250,
      image: prodBurberryBag,
      isAuthentic: true,
      description: "Handcrafted calfskin with 24k gold-finish monogram.",
    },
    moreExpensive: "B",
    explanation: "The Burberry TB Shoulder Bag retails for ₹1,35,000 (LIT Price ₹81,250), featuring full-grain Italian calfskin and precious metal hardware.",
  },
];

export const TESTIMONIALS_DATA = [
  {
    id: 1,
    quote: "The authentication process and quality of my Prada bag were simply immaculate. LIT is truly reimagining how India shops luxury.",
    author: "ANANYA S.",
    location: "Mumbai",
    rating: 5,
  },
  {
    id: 2,
    quote: "Finally a platform where luxury feels transparent, authenticated, and fairly priced without compromising on the boutique experience.",
    author: "RISHABH M.",
    location: "New Delhi",
    rating: 5,
  },
  {
    id: 3,
    quote: "Beautifully curated collection. The delivery was secure, fast, and the condition documentation gave 100% peace of mind.",
    author: "MEHERA A.",
    location: "Bengaluru",
    rating: 5,
  },
];
