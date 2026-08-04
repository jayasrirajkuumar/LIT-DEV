export const ORDER_CANCEL_WINDOW_MS = 30 * 60 * 1000;

const CANCELLABLE_STATUSES = ["PENDING", "CONFIRMED", "PROCESSING"];

export function isOrderStatusCancellable(status) {
  return CANCELLABLE_STATUSES.includes(status);
}

export function isWithinCancelWindow(createdAt) {
  if (!createdAt) return false;
  return Date.now() - new Date(createdAt).getTime() <= ORDER_CANCEL_WINDOW_MS;
}

export function getOrderCancelEligibility(order) {
  const statusOk = isOrderStatusCancellable(order.orderStatus);
  const withinWindow = isWithinCancelWindow(order.createdAt);
  return {
    canCancel: statusOk && withinWindow,
    cancelWindowExpired: statusOk && !withinWindow,
    cancelWindowMinutes: 30,
  };
}

export default {
  ORDER_CANCEL_WINDOW_MS,
  isOrderStatusCancellable,
  isWithinCancelWindow,
  getOrderCancelEligibility,
};
