import {
  getCheckoutPreview,
  createOrder,
  listUserOrders,
  getUserOrder,
  cancelUserOrder,
  reorder,
} from "../services/orderService.js";

export async function getCheckout(req, res) {
  const query = req.validatedQuery ?? {};
  const payload = {
    ...query,
    checkoutMode: query.checkoutMode ?? "cart",
    buyNow:
      query.checkoutMode === "buy_now"
        ? { productId: query.productId, quantity: query.quantity ?? 1 }
        : undefined,
  };
  const preview = await getCheckoutPreview(req.dbUser.id, payload);
  res.json({ success: true, data: preview });
}

export async function postCheckout(req, res) {
  const preview = await getCheckoutPreview(req.dbUser.id, req.validatedBody ?? {});
  res.json({ success: true, data: preview });
}

export async function postOrder(req, res) {
  const order = await createOrder(req.dbUser.id, req.validatedBody);
  res.status(201).json({ success: true, data: { order } });
}

export async function getOrders(req, res) {
  const orders = await listUserOrders(req.dbUser.id, req.validatedQuery ?? {});
  res.json({ success: true, data: { orders } });
}

export async function getOrderHistory(req, res) {
  const orders = await listUserOrders(req.dbUser.id, req.validatedQuery ?? {});
  res.json({ success: true, data: { orders } });
}

export async function getOrderById(req, res) {
  const order = await getUserOrder(req.dbUser.id, req.validatedParams.id);
  res.json({ success: true, data: { order } });
}

export async function patchCancelOrder(req, res) {
  const order = await cancelUserOrder(
    req.dbUser.id,
    req.validatedParams.id,
    req.validatedBody ?? {},
  );
  res.json({ success: true, data: { order } });
}

export async function postReorder(req, res) {
  const cart = await reorder(req.dbUser.id, req.validatedParams.id);
  res.json({ success: true, data: { cart } });
}

export default {
  getCheckout,
  postCheckout,
  postOrder,
  getOrders,
  getOrderHistory,
  getOrderById,
  patchCancelOrder,
  postReorder,
};
