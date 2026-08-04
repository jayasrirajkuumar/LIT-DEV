export function formatCatalogPrice(amount, currency = "INR") {
  const value = Number(amount);
  if (Number.isNaN(value)) return "—";

  if (currency === "INR") {
    return `Rs. ${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function getDiscountPercent(price, comparePrice) {
  const current = Number(price);
  const original = Number(comparePrice);
  if (!original || original <= current) return null;
  return Math.round(((original - current) / original) * 100);
}

export default {
  formatCatalogPrice,
  getDiscountPercent,
};
