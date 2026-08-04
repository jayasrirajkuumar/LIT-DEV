import { AppError } from "../utils/AppError.js";
import { cartRepository } from "../repositories/cartRepository.js";
import { wishlistRepository } from "../repositories/wishlistRepository.js";
import { productRepository } from "../repositories/productRepository.js";
import { isInStock } from "../utils/inventoryHelpers.js";

async function assertProductAvailable(productId) {
  const product = await productRepository.findById(productId);

  if (!product || product.status !== "ACTIVE") {
    throw new AppError("Product not found.", 404, "PRODUCT_NOT_FOUND");
  }

  if (!isInStock(product.inventory)) {
    throw new AppError("Product is out of stock.", 409, "PRODUCT_OUT_OF_STOCK");
  }

  return product;
}

export async function getCart(userId) {
  return cartRepository.findByUserId(userId);
}

export async function getCartCount(userId) {
  return cartRepository.getItemCount(userId);
}

export async function addToCart(userId, productId, quantity = 1) {
  await assertProductAvailable(productId);
  return cartRepository.addItem(userId, productId, quantity);
}

export async function updateCartItem(userId, productId, quantity) {
  if (quantity > 0) {
    await assertProductAvailable(productId);
  }
  return cartRepository.updateItemQuantity(userId, productId, quantity);
}

export async function removeFromCart(userId, productId) {
  return cartRepository.removeItem(userId, productId);
}

export async function moveWishlistItemToCart(userId, productId, quantity = 1) {
  await assertProductAvailable(productId);
  await wishlistRepository.removeItem(userId, productId);
  return cartRepository.addItem(userId, productId, quantity);
}

export async function moveCartItemToWishlist(userId, productId) {
  await wishlistRepository.addItem(userId, productId);
  return cartRepository.removeItem(userId, productId);
}

export default {
  getCart,
  getCartCount,
  addToCart,
  updateCartItem,
  removeFromCart,
  moveWishlistItemToCart,
  moveCartItemToWishlist,
};
