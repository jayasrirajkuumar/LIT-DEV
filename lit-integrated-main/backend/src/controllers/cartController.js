import {
  getCart,
  getCartCount,
  addToCart,
  updateCartItem,
  removeFromCart,
  moveWishlistItemToCart,
  moveCartItemToWishlist,
} from "../services/cartService.js";

export async function getCartHandler(req, res) {
  const cart = await getCart(req.dbUser.id);
  res.json({ success: true, data: { cart } });
}

export async function getCartCountHandler(req, res) {
  const count = await getCartCount(req.dbUser.id);
  res.json({ success: true, data: { count } });
}

export async function postCartItem(req, res) {
  const cart = await addToCart(
    req.dbUser.id,
    req.validatedBody.productId,
    req.validatedBody.quantity,
  );
  res.status(201).json({ success: true, data: { cart } });
}

export async function patchCartItem(req, res) {
  const cart = await updateCartItem(
    req.dbUser.id,
    req.validatedParams.productId,
    req.validatedBody.quantity,
  );
  res.json({ success: true, data: { cart } });
}

export async function deleteCartItem(req, res) {
  const cart = await removeFromCart(req.dbUser.id, req.validatedParams.productId);
  res.json({ success: true, data: { cart } });
}

export async function postMoveWishlistToCart(req, res) {
  const cart = await moveWishlistItemToCart(
    req.dbUser.id,
    req.validatedParams.productId,
    req.validatedBody?.quantity ?? 1,
  );
  res.json({ success: true, data: { cart } });
}

export async function postMoveCartToWishlist(req, res) {
  const cart = await moveCartItemToWishlist(req.dbUser.id, req.validatedParams.productId);
  res.json({ success: true, data: { cart } });
}

export default {
  getCartHandler,
  getCartCountHandler,
  postCartItem,
  patchCartItem,
  deleteCartItem,
  postMoveWishlistToCart,
  postMoveCartToWishlist,
};
