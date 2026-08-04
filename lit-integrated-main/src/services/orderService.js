import {
  fetchOrders,
  fetchOrderById,
  cancelOrder as cancelOrderApi,
  reorderItems,
} from "./orderApiService";
import { mapApiOrderToUi } from "../utils/orderMappers";

export async function getOrders(filters = {}) {
  const orders = await fetchOrders(filters);
  return orders.map(mapApiOrderToUi);
}

export async function getOrderById(orderId) {
  const order = await fetchOrderById(orderId);
  return mapApiOrderToUi(order);
}

export async function cancelOrder(orderId, payload) {
  const order = await cancelOrderApi(orderId, payload);
  return mapApiOrderToUi(order);
}

export async function reorder(orderId) {
  return reorderItems(orderId);
}

export default { getOrders, getOrderById, cancelOrder, reorder };
