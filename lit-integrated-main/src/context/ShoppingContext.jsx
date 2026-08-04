import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { useUserAuth } from "../hooks/useUserAuth";
import { consumePendingShoppingAction, useAuthModal } from "./AuthModalContext";
import {
  addCartItem,
  fetchCart,
  fetchWishlist,
  toggleWishlistItem,
  updateCartItem,
  removeCartItem,
  removeWishlistItem,
  moveWishlistToCart,
  moveCartToWishlist,
} from "../services/shoppingApiService";
import WishlistCollectionPicker from "../components/wishlist/WishlistCollectionPicker";

const ShoppingContext = createContext(null);

function showShoppingToast(message) {
  window.dispatchEvent(new CustomEvent("lit-toast", { detail: { message } }));
}

function showShoppingError(error, fallbackMessage) {
  showShoppingToast(error?.message || fallbackMessage);
}

export const ShoppingProvider = ({ children }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useUserAuth();
  const { requireAuth } = useAuthModal();
  const [cart, setCart] = useState(null);
  const [wishlist, setWishlist] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [wishlistIds, setWishlistIds] = useState(() => new Set());
  const [loading, setLoading] = useState(false);
  const [collectionPickerProductId, setCollectionPickerProductId] = useState(null);
  const refreshRef = useRef(null);

  const refreshShopping = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null);
      setWishlist(null);
      setCartCount(0);
      setWishlistCount(0);
      setWishlistIds(new Set());
      return;
    }

    if (refreshRef.current) {
      return refreshRef.current;
    }

    refreshRef.current = (async () => {
      setLoading(true);
      try {
        const [cartData, wishlistData] = await Promise.all([
          fetchCart(),
          fetchWishlist(),
        ]);
        setCart(cartData);
        setWishlist(wishlistData);
        setCartCount(cartData?.itemCount ?? 0);
        setWishlistCount(wishlistData?.itemCount ?? 0);
        setWishlistIds(new Set((wishlistData?.items ?? []).map((item) => item.productId)));
      } catch (error) {
        console.error("[ShoppingContext] refreshShopping failed:", error);
      } finally {
        setLoading(false);
      }
    })();

    try {
      return await refreshRef.current;
    } finally {
      refreshRef.current = null;
    }
  }, [isAuthenticated]);

  const executePendingAction = useCallback(
    async (action) => {
      if (!action) return;

      try {
        if (action.type === "add_to_cart") {
          await addCartItem(action.productId, action.quantity ?? 1);
          await refreshShopping();
          showShoppingToast("Added to cart");
        }

        if (action.type === "toggle_wishlist") {
          setCollectionPickerProductId(action.productId);
        }

        if (action.type === "buy_now") {
          navigate(
            `/shop/checkout?mode=buy_now&productId=${action.productId}&quantity=${action.quantity ?? 1}`,
          );
        }
      } catch (error) {
        showShoppingError(error, "Unable to complete your request. Please try again.");
      }

      if (action.type === "protected_route" && action.returnPath) {
        navigate(action.returnPath);
      }
    },
    [navigate, refreshShopping],
  );

  useEffect(() => {
    refreshShopping();
  }, [refreshShopping]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const pending = consumePendingShoppingAction();
    if (pending) {
      executePendingAction(pending);
    }
  }, [isAuthenticated, executePendingAction]);

  useEffect(() => {
    const handleAuthChange = () => refreshShopping();
    window.addEventListener("lit-auth-change", handleAuthChange);
    return () => window.removeEventListener("lit-auth-change", handleAuthChange);
  }, [refreshShopping]);

  const addToCart = useCallback(
    async (productId, quantity = 1) => {
      if (!isAuthenticated) {
        requireAuth({ type: "add_to_cart", productId, quantity });
        return false;
      }

      try {
        const updated = await addCartItem(productId, quantity);
        setCart(updated);
        setCartCount(updated.itemCount ?? 0);
        showShoppingToast("Added to cart");
        return true;
      } catch (error) {
        showShoppingError(error, "Unable to add item to cart.");
        return false;
      }
    },
    [isAuthenticated, requireAuth],
  );

  const buyNow = useCallback(
    async (productId, quantity = 1) => {
      if (!isAuthenticated) {
        requireAuth({ type: "buy_now", productId, quantity });
        return false;
      }

      navigate(`/shop/checkout?mode=buy_now&productId=${productId}&quantity=${quantity}`);
      return true;
    },
    [isAuthenticated, navigate, requireAuth],
  );

  const openWishlistPicker = useCallback(
    (productId) => {
      if (!isAuthenticated) {
        requireAuth({ type: "toggle_wishlist", productId });
        return false;
      }
      setCollectionPickerProductId(productId);
      return true;
    },
    [isAuthenticated, requireAuth],
  );

  const toggleWishlist = useCallback(
    async (productId, collectionId = null) => {
      if (!isAuthenticated) {
        requireAuth({ type: "toggle_wishlist", productId });
        return false;
      }

      if (!collectionId) {
        setCollectionPickerProductId(productId);
        return true;
      }

      try {
        const result = await toggleWishlistItem(productId, collectionId);
        setWishlist(result);
        setWishlistCount(result.itemCount ?? 0);
        setWishlistIds(new Set((result.items ?? []).map((item) => item.productId)));
        showShoppingToast(result.added ? "Added to wishlist" : "Removed from wishlist");
        return true;
      } catch (error) {
        showShoppingError(error, "Unable to update wishlist.");
        return false;
      }
    },
    [isAuthenticated, requireAuth],
  );

  const isWishlisted = useCallback(
    (productId) => wishlistIds.has(productId),
    [wishlistIds],
  );

  const value = useMemo(
    () => ({
      cart,
      wishlist,
      cartCount,
      wishlistCount,
      wishlistIds,
      loading,
      refreshShopping,
      executePendingAction,
      addToCart,
      buyNow,
      toggleWishlist,
      openWishlistPicker,
      isWishlisted,
      updateCartItemQuantity: async (productId, quantity) => {
        const updated = await updateCartItem(productId, quantity);
        setCart(updated);
        setCartCount(updated.itemCount);
        return updated;
      },
      removeFromCart: async (productId) => {
        const updated = await removeCartItem(productId);
        setCart(updated);
        setCartCount(updated.itemCount);
        return updated;
      },
      removeFromWishlist: async (productId) => {
        const updated = await removeWishlistItem(productId);
        setWishlist(updated);
        setWishlistCount(updated.itemCount);
        setWishlistIds(new Set(updated.items.map((item) => item.productId)));
        return updated;
      },
      moveWishlistItemToCart: async (productId, quantity = 1) => {
        const updatedCart = await moveWishlistToCart(productId, quantity);
        await refreshShopping();
        window.dispatchEvent(new CustomEvent("lit-toast", { detail: { message: "Moved to cart" } }));
        return updatedCart;
      },
      moveCartItemToWishlist: async (productId) => {
        await moveCartToWishlist(productId);
        await refreshShopping();
        window.dispatchEvent(new CustomEvent("lit-toast", { detail: { message: "Moved to wishlist" } }));
      },
    }),
    [
      cart,
      wishlist,
      cartCount,
      wishlistCount,
      wishlistIds,
      loading,
      refreshShopping,
      executePendingAction,
      addToCart,
      buyNow,
      toggleWishlist,
      openWishlistPicker,
      isWishlisted,
    ],
  );

  return (
    <ShoppingContext.Provider value={value}>
      {children}
      <WishlistCollectionPicker
        productId={collectionPickerProductId}
        open={Boolean(collectionPickerProductId)}
        onClose={() => setCollectionPickerProductId(null)}
        onSaved={refreshShopping}
      />
    </ShoppingContext.Provider>
  );
};

export const useShopping = () => {
  const context = useContext(ShoppingContext);
  if (!context) {
    throw new Error("useShopping must be used within ShoppingProvider");
  }
  return context;
};

export default ShoppingProvider;
