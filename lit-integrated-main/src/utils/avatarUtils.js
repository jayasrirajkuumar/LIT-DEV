/**
 * Generates a deterministic background color from a string (e.g. user email).
 */
function stringToColor(value = "") {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 55%, 45%)`;
}

export function getUserInitials(name = "", email = "") {
  const source = name.trim() || email.trim();
  if (!source) return "U";

  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return source.slice(0, 2).toUpperCase();
}

export function getAvatarFallbackData(name = "", email = "") {
  const initials = getUserInitials(name, email);
  const backgroundColor = stringToColor(email || name || initials);
  return { initials, backgroundColor };
}
