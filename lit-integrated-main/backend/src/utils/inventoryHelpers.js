/**
 * Inventory helper methods for product stock tracking.
 * Used by services and API mappers — not persisted logic.
 */

export function availableQuantity(inventory) {
  if (!inventory) return 0;
  return Math.max(0, inventory.quantity - inventory.reservedQuantity);
}

export function isInStock(inventory) {
  return availableQuantity(inventory) > 0;
}

export function isLowStock(inventory) {
  if (!inventory) return false;
  const available = availableQuantity(inventory);
  return available > 0 && available <= inventory.lowStockThreshold;
}

export function mapInventoryPublic(inventory) {
  if (!inventory) {
    return {
      quantity: 0,
      reservedQuantity: 0,
      lowStockThreshold: 5,
      availableQuantity: 0,
      isInStock: false,
      isLowStock: false,
    };
  }

  const available = availableQuantity(inventory);

  return {
    quantity: inventory.quantity,
    reservedQuantity: inventory.reservedQuantity,
    lowStockThreshold: inventory.lowStockThreshold,
    availableQuantity: available,
    isInStock: available > 0,
    isLowStock: available > 0 && available <= inventory.lowStockThreshold,
  };
}

export default {
  availableQuantity,
  isInStock,
  isLowStock,
  mapInventoryPublic,
};
