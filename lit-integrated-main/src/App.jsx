import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";

// Contexts
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { AuthProvider } from "./context/context-admin/AuthContext";
import { DataProvider } from "./context/context-admin/DataContext";
import { ArticleProvider } from "./context/ArticleContext";
import { UserAuthProvider } from "./context/UserAuthContext";
import { AuthModalProvider } from "./context/AuthModalContext";
import { ShoppingProvider } from "./context/ShoppingContext";
import { ToastProvider } from "./context/ToastContext";
import { NotificationProvider } from "./context/NotificationContext";
import UserProtectedRoute from "./components/UserProtectedRoute";

// Layout & UI
import Background from "./components/Background/Background";
import Footer from "./components/Newsletter-components/Footer/Footer";
import LandingPageNavbar from "./components/Newsletter-components/Navbar/Navbar";
import Navbar from "./components/Newsletter-components/Navbar/Navbar";
import MainLayout from "./components/Newsletter-components/MainLayout/MainLayout";
import ProtectedRoute from "./components/admin-components/ProtectedRoute";
import EcomAdminProtectedRoute from "./components/admin-components/EcomAdminProtectedRoute";
import AdminLayout from "./components/admin-components/AdminLayout";
import Notification from "./components/Notification";
import ScrollToTop from "./components/ScrollToTop";

import EcomAdminDashboard from "./pages/admin/EcomAdminDashboard";
import EcomDashboardView from "./components/EcommerceAdmin/EcomDashboardView";
import EcomProductsView from "./components/EcommerceAdmin/EcomProductsView";
import AdminAddProductPage from "./components/EcommerceAdmin/AdminAddProductPage";
import EditProductForm from "./components/EcommerceAdmin/EditProductForm";
import ProductDetailPage from "./components/EcommerceAdmin/ProductDetailPage";

// Dummy admin pages for sidebar
import AdminInventoryView from "./components/EcommerceAdmin/AdminInventoryView";
import AdminCustomersView from "./components/EcommerceAdmin/AdminCustomersView";
import AdminOrdersView from "./components/EcommerceAdmin/AdminOrdersView";
import AdminSupportView from "./components/EcommerceAdmin/AdminSupportView";
import AdminWishlistCollectionsView from "./components/EcommerceAdmin/AdminWishlistCollectionsView";
import AdminWishlistItemsView from "./components/EcommerceAdmin/AdminWishlistItemsView";
import AdminCartsView from "./components/EcommerceAdmin/AdminCartsView";
import AdminMarketplaceView from "./components/EcommerceAdmin/AdminMarketplaceView";
import AdminNotificationsView from "./components/EcommerceAdmin/AdminNotificationsView";
import AdminCategoriesView from "./components/EcommerceAdmin/AdminCategoriesView";
import {
  Analytics,
  Offers,
  Sales,
  Newsletter,
  Settings as AdminSettings,
} from "./components/EcommerceAdmin/AdminDummyPages";

// Pages - Public
import LandingPage from "./components/LandingPage";
import Shop from "./pages/Shop";
import ProductDetails from "./components/Shop/ProductDetails";
import ProductDetailsPage from "./pages/ProductDetailsPage/ProductDetailsPage"; // keep both, for old/new usage
import ShoppingCartPage from "./pages/ShoppingCartPage";
import Wishlist from "./pages/Wishlist";
import GameModes from "./pages/GameModes";
import About from "./pages/About";
import Contact from "./pages/Contact";
import SupportCenter from "./pages/SupportCenter";
import Profile from "./pages/profile/Profile/Profile";
import PrivacyPolicy from "./pages/privacyPolicy";
import ReturnPolicy from "./pages/returnPolicy";
import TermsOfService from "./pages/termsOfService";
import OrdersProfile from "./pages/profile/Orders";
import CheckoutPage from "./components/checkout/CheckoutPage";
import OrderConfirmation from "./pages/OrderConfirmation";
import NotFound from "./pages/NotFound";
import ComingSoonPage from "./components/ComingSoonPage/ComingSoonPage";

// Marketplace (Phase 3.5)
import ShopHomePage from "./pages/marketplace/ShopHomePage";
import CategoryPage from "./pages/marketplace/CategoryPage";
import CatalogListingPage from "./pages/marketplace/CatalogListingPage";
import CatalogProductPage from "./pages/marketplace/CatalogProductPage";
import SearchPage from "./pages/marketplace/SearchPage";
import MarketplaceCheckoutPage from "./pages/marketplace/MarketplaceCheckoutPage";
import GiftCardsPage from "./pages/gift-cards/GiftCardsPage";
import GiftCardRedeemPage from "./pages/gift-cards/GiftCardRedeemPage";
import GiftCardReceivedPage from "./pages/gift-cards/GiftCardReceivedPage";
import GiftCardClaimPage from "./pages/gift-cards/GiftCardClaimPage";
import NotificationsPage from "./pages/notifications/NotificationsPage";
import WalletPage from "./pages/profile/Wallet/WalletPage";
import AdminGiftCardsView from "./components/EcommerceAdmin/AdminGiftCardsView";

// Orders pages (new)
import OrdersPage from "./pages/OrdersPage/OrdersPage";
import OrderDetailsPage from "./pages/OrderDetailsPage/OrderDetailsPage";

// Pages - Admin
import AdminLogin from "./pages/AdminLogin";
import SignUpPage from "./pages/admin/Auth/SignUpPage";
import AdminDashboard from "./pages/admin/AdminDashboard/AdminDashboard";
import ContentManager from "./pages/admin/ContentManager/ContentManager";
import ArticleEditor from "./pages/admin/ArticleEditor/ArticleEditor";
import MailAdderPage from "./pages/admin/MailAdderPage/MailAdderPage";
import MailItemEditor from "./pages/admin/MailItemEditor/MailItemEditor";
import AdminArticlePage from "./pages/admin/ArticlePage";
import DeleteProductForm from "./components/DeleteProductForm";
import AuthCallback from "./pages/AuthCallback";
import SignIn from "./auth/SignIn";
import SignUp from "./auth/SignUp";
import SignUpDetails from "./auth/SignUpDetails";
import VerifyOtp from "./auth/VerifyOtp";

// Pages - Newsletter
import NewsletterPage from "./pages/Newsletter/NewsletterPage/NewsletterPage";
import NewsletterArticlePage from "./pages/Newsletter/ArticlePage/ArticlePage";

// Payment
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

const AppContent = () => {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith("/admin");
  const isNewsletterPath = location.pathname.startsWith("/newsletter");
  const isNewsletterArticle = location.pathname.startsWith(
    "/newsletter/article",
  );

  const comingSoonPaths = [
    "/game-modes",
    "/ir-icon",
    "/socials",
    "/avatar-store",
    "/newsletter",
  ];
  const isComingSoonPath =
    comingSoonPaths.includes(location.pathname) ||
    location.pathname.startsWith("/newsletter");

  const marketplaceRoutesList = [
    "/shop",
    "/marketplace",
    "/gift-cards",
    "/men",
    "/women",
    "/kids",
    "/bags",
    "/shoes",
    "/clothing",
    "/accessories",
    "/new-arrivals",
    "/clearance",
    "/designers",
    "/authentication",
  ];
  const isMarketplacePath = marketplaceRoutesList.some((path) =>
    location.pathname.startsWith(path),
  );
  const isAuthPath =
    location.pathname === "/sign-in" ||
    location.pathname === "/sign-up" ||
    location.pathname === "/sign-up/email" ||
    location.pathname === "/auth/verify-otp";
  const showMainNavbar =
    !isAdminPath &&
    !isNewsletterPath &&
    !isNewsletterArticle &&
    !isComingSoonPath &&
    !isMarketplacePath &&
    !isAuthPath;
  const showNewsletterNavbar =
    (isNewsletterPath || isNewsletterArticle) && !isComingSoonPath;
  const showFooter = !isAdminPath && !isComingSoonPath && !isAuthPath && !isMarketplacePath;

  return (
    <Background className={isAuthPath ? "background-container--auth" : ""}>
      <ScrollToTop />
      <Notification />
      {showMainNavbar && <LandingPageNavbar />}
      {showNewsletterNavbar && <Navbar />}

      <main style={{ flex: 1, width: "100%" }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/shop" element={<ShopHomePage />} />
          <Route path="/marketplace" element={<ShopHomePage />} />
          <Route path="/men" element={<Navigate to="/shop/products?gender=men" replace />} />
          <Route path="/women" element={<Navigate to="/shop/products?gender=women" replace />} />
          <Route path="/kids" element={<Navigate to="/shop/products?kids=true" replace />} />
          <Route path="/bags" element={<Navigate to="/shop/products?category=bags" replace />} />
          <Route path="/shoes" element={<Navigate to="/shop/products?category=shoes" replace />} />
          <Route path="/clothing" element={<Navigate to="/shop/products?category=clothing" replace />} />
          <Route path="/accessories" element={<Navigate to="/shop/products?category=accessories" replace />} />
          <Route path="/new-arrivals" element={<Navigate to="/shop/products?sort=newest" replace />} />
          <Route path="/clearance" element={<Navigate to="/shop/products?clearance=true" replace />} />
          <Route path="/designers" element={<Navigate to="/shop/products" replace />} />
          <Route path="/authentication" element={<Navigate to="/about" replace />} />
          <Route path="/shop/products" element={<CatalogListingPage />} />
          <Route path="/shop/category/:slug" element={<CategoryPage />} />
          <Route path="/shop/product/:slug" element={<CatalogProductPage />} />
          <Route path="/shop/search" element={<SearchPage />} />
          <Route path="/shop/gift-cards" element={<Navigate to="/gift-cards" replace />} />
          <Route path="/gift-cards" element={<GiftCardsPage />} />
          <Route path="/gift-cards/redeem" element={<GiftCardRedeemPage />} />
          <Route path="/gift-cards/claim/:id" element={<UserProtectedRoute><GiftCardClaimPage /></UserProtectedRoute>} />
          <Route path="/gift-cards/received/:giftCardId" element={<UserProtectedRoute><GiftCardReceivedPage /></UserProtectedRoute>} />
          <Route path="/notifications" element={<UserProtectedRoute><NotificationsPage /></UserProtectedRoute>} />
          <Route
            path="/shop/checkout"
            element={
              <UserProtectedRoute>
                <MarketplaceCheckoutPage />
              </UserProtectedRoute>
            }
          />
          {/* keeping both old and new product details paths */}
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/product-page/:id" element={<ProductDetailsPage />} />
          <Route path="/cart" element={<ShoppingCartPage />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/game-modes" element={<ComingSoonPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/support" element={<SupportCenter />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/returnpolicy" element={<ReturnPolicy />} />
          <Route
            path="/profile"
            element={
              <UserProtectedRoute>
                <Profile />
              </UserProtectedRoute>
            }
          />
          <Route
            path="/profile/wallet"
            element={
              <UserProtectedRoute>
                <WalletPage />
              </UserProtectedRoute>
            }
          />

          {/* Orders routes */}
          <Route
            path="/orders"
            element={
              <UserProtectedRoute>
                <OrdersPage />
              </UserProtectedRoute>
            }
          />
          <Route
            path="/orders/:orderId"
            element={
              <UserProtectedRoute>
                <OrderDetailsPage />
              </UserProtectedRoute>
            }
          />
          <Route path="/orders-old" element={<OrdersProfile />} />

          <Route
            path="/checkout"
            element={
              <UserProtectedRoute>
                <CheckoutPage />
              </UserProtectedRoute>
            }
          />
          <Route path="/order-confirmation" element={<OrderConfirmation />} />
          <Route path="/products" element={<Navigate to="/shop/products" replace />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/sign-up" element={<SignUpDetails />} />
          <Route path="/sign-up/email" element={<SignUp />} />
          <Route path="/auth/verify-otp" element={<VerifyOtp />} />
          <Route path="/ir-icon" element={<ComingSoonPage />} />
          <Route path="/socials" element={<ComingSoonPage />} />
          <Route path="/avatar-store" element={<ComingSoonPage />} />

          {/* Newsletter Routes */}
          <Route path="/newsletter" element={<ComingSoonPage />} />
          <Route
            path="/newsletter/article/:slug"
            element={<ComingSoonPage />}
          />

          {/* Admin E-commerce Dashboard */}
          <Route
            path="/admin/ecomDashboard/*"
            element={
              <EcomAdminProtectedRoute>
                <EcomAdminDashboard />
              </EcomAdminProtectedRoute>
            }
          >
            <Route index element={<EcomDashboardView />} />
            <Route path="products" element={<EcomProductsView />} />
            <Route path="products/add" element={<AdminAddProductPage />} />
            <Route path="products/edit/:id" element={<EditProductForm />} />
            <Route path="products/:id" element={<ProductDetailPage />} />
            <Route path="categories" element={<AdminCategoriesView />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="offers" element={<Offers />} />
            <Route path="inventory" element={<AdminInventoryView />} />
            <Route path="orders" element={<AdminOrdersView />} />
            <Route path="notifications" element={<AdminNotificationsView />} />
            <Route path="support" element={<AdminSupportView />} />
            <Route path="gift-cards" element={<AdminGiftCardsView />} />
            <Route path="wishlists" element={<AdminWishlistCollectionsView />} />
            <Route path="wishlist-items" element={<AdminWishlistItemsView />} />
            <Route path="carts" element={<AdminCartsView />} />
            <Route path="marketplace" element={<AdminMarketplaceView />} />
            <Route path="sales" element={<Sales />} />
            <Route path="customers" element={<AdminCustomersView />} />
            <Route path="newsletter" element={<Newsletter />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/signup" element={<SignUpPage />} />
          <Route path="/admin/article/:slug" element={<AdminArticlePage />} />
          <Route
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route
              path="/admin/ecomDashboard"
              element={<EcomAdminDashboard />}
            />
            <Route path="/admin/edit-product" element={<EditProductForm />} />
            <Route
              path="/admin/delete-product"
              element={<DeleteProductForm />}
            />
            <Route
              path="/admin/website"
              element={<ContentManager section="website" />}
            />
            <Route
              path="/admin/mail"
              element={<ContentManager section="mail" />}
            />
            <Route path="/admin/mail/add" element={<MailAdderPage />} />
            <Route path="/admin/mail/edit/:id" element={<MailItemEditor />} />
            <Route path="/admin/editor/:section" element={<ArticleEditor />} />
            <Route
              path="/admin/editor/:section/:slug"
              element={<ArticleEditor />}
            />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {showFooter && (
        <Footer className={isMarketplacePath ? "footer--marketplace" : ""} />
      )}
    </Background>
  );
};

const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID ?? "";
const paypalEnabled =
  Boolean(paypalClientId) && !/placeholder/i.test(paypalClientId);

const AppProviders = ({ children }) => {
  if (!paypalEnabled) {
    return children;
  }

  return (
    <PayPalScriptProvider
      options={{
        "client-id": paypalClientId,
        currency: "INR",
        intent: "capture",
      }}
    >
      {children}
    </PayPalScriptProvider>
  );
};

const App = () => (
  <AppProviders>
    <CartProvider>
      <WishlistProvider>
        <AuthProvider>
          <DataProvider>
            <ArticleProvider>
              <Router>
                <UserAuthProvider>
                  <NotificationProvider>
                    <AuthModalProvider>
                      <ShoppingProvider>
                        <ToastProvider>
                          <AppContent />
                        </ToastProvider>
                      </ShoppingProvider>
                    </AuthModalProvider>
                  </NotificationProvider>
                </UserAuthProvider>
              </Router>
            </ArticleProvider>
          </DataProvider>
        </AuthProvider>
      </WishlistProvider>
    </CartProvider>
  </AppProviders>
);

export default App;
