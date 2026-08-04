import {
  getWishlist,
  getWishlistCount,
  addToWishlist,
  removeFromWishlist,
  toggleWishlistItem,
  moveWishlistItemToCart,
  listCollections,
  createCollection,
  updateCollection,
  deleteCollection,
  setDefaultCollection,
  moveWishlistItem,
  copyWishlistItem,
  getProductWishlistCollections,
} from "../services/wishlistService.js";

export async function getWishlistHandler(req, res) {
  const wishlist = await getWishlist(req.dbUser.id);
  res.json({ success: true, data: { wishlist } });
}

export async function getWishlistCountHandler(req, res) {
  const count = await getWishlistCount(req.dbUser.id);
  res.json({ success: true, data: { count } });
}

export async function getCollectionsHandler(req, res) {
  const collections = await listCollections(req.dbUser.id);
  res.json({ success: true, data: { collections } });
}

export async function postCollectionHandler(req, res) {
  const wishlist = await createCollection(req.dbUser.id, req.validatedBody);
  res.status(201).json({ success: true, data: { wishlist } });
}

export async function patchCollectionHandler(req, res) {
  const wishlist = await updateCollection(
    req.dbUser.id,
    req.validatedParams.id,
    req.validatedBody,
  );
  res.json({ success: true, data: { wishlist } });
}

export async function deleteCollectionHandler(req, res) {
  const wishlist = await deleteCollection(req.dbUser.id, req.validatedParams.id);
  res.json({ success: true, data: { wishlist } });
}

export async function patchDefaultCollectionHandler(req, res) {
  const wishlist = await setDefaultCollection(req.dbUser.id, req.validatedParams.id);
  res.json({ success: true, data: { wishlist } });
}

export async function postWishlistItem(req, res) {
  const wishlist = await addToWishlist(
    req.dbUser.id,
    req.validatedParams.productId,
    req.validatedBody?.collectionId,
  );
  res.status(201).json({ success: true, data: { wishlist } });
}

export async function deleteWishlistItem(req, res) {
  const wishlist = await removeFromWishlist(
    req.dbUser.id,
    req.validatedParams.productId,
    req.query.collectionId,
  );
  res.json({ success: true, data: { wishlist } });
}

export async function postToggleWishlistItem(req, res) {
  const result = await toggleWishlistItem(
    req.dbUser.id,
    req.validatedParams.productId,
    req.validatedBody?.collectionId,
  );
  res.json({ success: true, data: result });
}

export async function postMoveWishlistItem(req, res) {
  const wishlist = await moveWishlistItem(
    req.dbUser.id,
    req.validatedParams.productId,
    req.validatedBody.targetCollectionId,
  );
  res.json({ success: true, data: { wishlist } });
}

export async function postCopyWishlistItem(req, res) {
  const wishlist = await copyWishlistItem(
    req.dbUser.id,
    req.validatedParams.productId,
    req.validatedBody.targetCollectionId,
  );
  res.json({ success: true, data: { wishlist } });
}

export async function getProductCollectionsHandler(req, res) {
  const collections = await getProductWishlistCollections(
    req.dbUser.id,
    req.validatedParams.productId,
  );
  res.json({ success: true, data: { collections } });
}

export async function postWishlistToCart(req, res) {
  const cart = await moveWishlistItemToCart(
    req.dbUser.id,
    req.validatedParams.productId,
    req.validatedBody?.quantity ?? 1,
  );
  res.json({ success: true, data: { cart } });
}

export default {
  getWishlistHandler,
  getWishlistCountHandler,
  getCollectionsHandler,
  postCollectionHandler,
  patchCollectionHandler,
  deleteCollectionHandler,
  patchDefaultCollectionHandler,
  postWishlistItem,
  deleteWishlistItem,
  postToggleWishlistItem,
  postMoveWishlistItem,
  postCopyWishlistItem,
  getProductCollectionsHandler,
  postWishlistToCart,
};
