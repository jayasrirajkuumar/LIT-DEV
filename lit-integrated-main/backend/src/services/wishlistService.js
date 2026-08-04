import { AppError } from "../utils/AppError.js";
import { wishlistRepository } from "../repositories/wishlistRepository.js";
import { cartRepository } from "../repositories/cartRepository.js";
import { productRepository } from "../repositories/productRepository.js";

async function assertProductExists(productId) {
  const product = await productRepository.findById(productId);

  if (!product || product.status === "ARCHIVED") {
    throw new AppError("Product not found.", 404, "PRODUCT_NOT_FOUND");
  }

  return product;
}

function mapRepoError(error) {
  if (error.message === "COLLECTION_NOT_FOUND") {
    throw new AppError("Collection not found.", 404, "COLLECTION_NOT_FOUND");
  }
  if (error.message === "CANNOT_DELETE_DEFAULT") {
    throw new AppError("The default collection cannot be deleted.", 409, "CANNOT_DELETE_DEFAULT");
  }
  if (error.message === "ITEM_NOT_FOUND") {
    throw new AppError("Wishlist item not found.", 404, "ITEM_NOT_FOUND");
  }
  throw error;
}

export async function getWishlist(userId) {
  return wishlistRepository.findByUserId(userId);
}

export async function getWishlistCount(userId) {
  return wishlistRepository.getItemCount(userId);
}

export async function listCollections(userId) {
  return wishlistRepository.listCollections(userId);
}

export async function createCollection(userId, payload) {
  try {
    return await wishlistRepository.createCollection(userId, payload);
  } catch (error) {
    mapRepoError(error);
  }
}

export async function updateCollection(userId, collectionId, payload) {
  try {
    return await wishlistRepository.updateCollection(userId, collectionId, payload);
  } catch (error) {
    mapRepoError(error);
  }
}

export async function deleteCollection(userId, collectionId) {
  try {
    return await wishlistRepository.deleteCollection(userId, collectionId);
  } catch (error) {
    mapRepoError(error);
  }
}

export async function setDefaultCollection(userId, collectionId) {
  try {
    return await wishlistRepository.setDefaultCollection(userId, collectionId);
  } catch (error) {
    mapRepoError(error);
  }
}

export async function addToWishlist(userId, productId, collectionId = null) {
  await assertProductExists(productId);
  return wishlistRepository.addItem(userId, productId, collectionId);
}

export async function removeFromWishlist(userId, productId, collectionId = null) {
  return wishlistRepository.removeItem(userId, productId, collectionId);
}

export async function toggleWishlistItem(userId, productId, collectionId = null) {
  await assertProductExists(productId);
  return wishlistRepository.toggleItem(userId, productId, collectionId);
}

export async function moveWishlistItem(userId, productId, targetCollectionId) {
  try {
    return await wishlistRepository.moveItem(userId, productId, targetCollectionId);
  } catch (error) {
    mapRepoError(error);
  }
}

export async function copyWishlistItem(userId, productId, targetCollectionId) {
  try {
    await assertProductExists(productId);
    return await wishlistRepository.copyItem(userId, productId, targetCollectionId);
  } catch (error) {
    mapRepoError(error);
  }
}

export async function moveWishlistItemToCart(userId, productId, quantity = 1) {
  await assertProductExists(productId);
  await wishlistRepository.removeItem(userId, productId);
  return cartRepository.addItem(userId, productId, quantity);
}

export async function getProductWishlistCollections(userId, productId) {
  return wishlistRepository.getProductCollections(userId, productId);
}

export default {
  getWishlist,
  getWishlistCount,
  listCollections,
  createCollection,
  updateCollection,
  deleteCollection,
  setDefaultCollection,
  addToWishlist,
  removeFromWishlist,
  toggleWishlistItem,
  moveWishlistItem,
  copyWishlistItem,
  moveWishlistItemToCart,
  getProductWishlistCollections,
};
