export const DEFAULT_STORE_SETTINGS = {
  general: {
    storeName: "LIT Marketplace",
    storeTagline: "Premium lifestyle products",
    supportEmail: "support@lit.com",
    supportPhone: "",
    timezone: "Asia/Kolkata",
  },
  branding: {
    logoUrl: "",
    faviconUrl: "",
    primaryColor: "#1a1a2e",
    accentColor: "#e94560",
  },
  currency: {
    code: "INR",
    symbol: "₹",
    decimalPlaces: 2,
    position: "before",
  },
  taxes: {
    enabled: true,
    defaultRate: 18,
    taxInclusive: false,
    gstNumber: "",
  },
  shipping: {
    standardRate: 99,
    expressRate: 199,
    freeShippingThreshold: 999,
    estimatedDaysStandard: "5-7",
    estimatedDaysExpress: "2-3",
  },
  email: {
    fromName: "LIT Marketplace",
    fromEmail: "noreply@lit.com",
    orderConfirmation: true,
    shippingUpdates: true,
    marketingEmails: false,
  },
  payment: {
    provider: "MOCK",
    razorpayEnabled: false,
    stripeEnabled: false,
    note: "Payment gateway configuration placeholder",
  },
  returnPolicy: {
    enabled: true,
    windowDays: 7,
    content: "Items may be returned within 7 days of delivery in original condition.",
  },
  terms: {
    content: "Terms and conditions apply. See full terms on the storefront.",
  },
  privacy: {
    content: "We respect your privacy and protect your personal data.",
  },
  contact: {
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    businessHours: "Mon–Sat, 10am–6pm IST",
  },
  welcomeCoupon: {
    enabled: true,
    amount: 500,
    expiryDays: 30,
    prefix: "WELCOME",
  },
  giftCards: {
    enabled: true,
    minAmount: 100,
    maxAmount: 50000,
    expiryMonths: 12,
    platformFeePercent: 0,
    gstPercent: 18,
    presetAmounts: [250, 500, 1000, 2000, 5000, 10000],
  },
};

export default DEFAULT_STORE_SETTINGS;
