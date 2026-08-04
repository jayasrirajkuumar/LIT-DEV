const PROFILE_EXTENSIONS_PREFIX = "lit_profile_extensions_";
const PROFILE_AVATAR_PREFIX = "lit_profile_avatar_";
const ADDRESSES_PREFIX = "lit_user_addresses_";

function getUserKey(prefix, azureUserId) {
  if (!azureUserId) return null;
  return `${prefix}${azureUserId}`;
}

export function getDefaultProfileExtensions(email = "") {
  const usernameBase = email.split("@")[0]?.replace(/[^a-zA-Z0-9_]/g, "") || "user";
  return {
    username: `@${usernameBase}`,
    phone: "",
    country: "",
    bio: "",
  };
}

export function getProfileExtensions(azureUserId) {
  const key = getUserKey(PROFILE_EXTENSIONS_PREFIX, azureUserId);
  if (!key) return getDefaultProfileExtensions();

  try {
    const raw = localStorage.getItem(key);
    return raw
      ? { ...getDefaultProfileExtensions(), ...JSON.parse(raw) }
      : getDefaultProfileExtensions();
  } catch {
    return getDefaultProfileExtensions();
  }
}

export function saveProfileExtensions(azureUserId, extensions) {
  const key = getUserKey(PROFILE_EXTENSIONS_PREFIX, azureUserId);
  if (!key) return;

  localStorage.setItem(key, JSON.stringify(extensions));
  window.dispatchEvent(new Event("lit-profile-change"));
}

export function getProfileAvatar(azureUserId) {
  const key = getUserKey(PROFILE_AVATAR_PREFIX, azureUserId);
  if (!key) return null;
  return localStorage.getItem(key);
}

export function saveProfileAvatar(azureUserId, dataUrl) {
  const key = getUserKey(PROFILE_AVATAR_PREFIX, azureUserId);
  if (!key) return;
  localStorage.setItem(key, dataUrl);
  window.dispatchEvent(new Event("lit-profile-change"));
}

export function removeProfileAvatar(azureUserId) {
  const key = getUserKey(PROFILE_AVATAR_PREFIX, azureUserId);
  if (!key) return;
  localStorage.removeItem(key);
  window.dispatchEvent(new Event("lit-profile-change"));
}

export function getSavedAddresses(azureUserId) {
  const key = getUserKey(ADDRESSES_PREFIX, azureUserId);
  if (!key) return [];

  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persistAddresses(azureUserId, addresses) {
  const key = getUserKey(ADDRESSES_PREFIX, azureUserId);
  if (!key) return;
  localStorage.setItem(key, JSON.stringify(addresses));
  window.dispatchEvent(new Event("lit-profile-change"));
}

export function addAddress(azureUserId, address) {
  const addresses = getSavedAddresses(azureUserId);
  const newAddress = {
    id: crypto.randomUUID?.() || `addr-${Date.now()}`,
    ...address,
    createdAt: new Date().toISOString(),
  };
  persistAddresses(azureUserId, [...addresses, newAddress]);
  return newAddress;
}

export function updateAddress(azureUserId, addressId, updates) {
  const addresses = getSavedAddresses(azureUserId).map((address) =>
    address.id === addressId ? { ...address, ...updates } : address,
  );
  persistAddresses(azureUserId, addresses);
  return addresses.find((address) => address.id === addressId) || null;
}

export function deleteAddress(azureUserId, addressId) {
  const addresses = getSavedAddresses(azureUserId).filter(
    (address) => address.id !== addressId,
  );
  persistAddresses(azureUserId, addresses);
}

export function formatMemberSince(dateValue) {
  if (!dateValue) return "—";
  return new Date(dateValue).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

export function formatAddress(address) {
  if (!address) return "";
  const line1 = address.line1 || address.addressLine1;
  return [
    line1,
    address.line2 || address.addressLine2,
    [address.city, address.state, address.postalCode].filter(Boolean).join(", "),
    address.country,
  ]
    .filter(Boolean)
    .join("\n");
}
