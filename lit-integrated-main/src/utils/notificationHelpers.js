export function formatRelativeTime(isoDate) {
  const date = new Date(isoDate);
  const diffMs = Date.now() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hr ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay === 1) return "Yesterday";
  if (diffDay < 7) return `${diffDay} days ago`;
  return date.toLocaleDateString();
}

export function getNotificationIcon(type) {
  if (type?.startsWith("GIFT_CARD")) return "🎁";
  if (type === "WALLET_CREDITED") return "💰";
  if (type === "WALLET_DEBITED") return "💳";
  return "🔔";
}

export function getNotificationPath(notification) {
  if (notification.entityType === "gift_card" && notification.entityId) {
    if (notification.type === "GIFT_CARD_RECEIVED") {
      return `/gift-cards/received/${notification.entityId}`;
    }
    return `/gift-cards/received/${notification.entityId}`;
  }
  return "/notifications";
}
