import {
  createAddress,
  deleteAddress,
  getAddresses,
  updateAddress,
} from "./userApiService";
import { logPersistence, logPersistenceError } from "../utils/persistenceLogger";

export function apiAddressToUi(address) {
  return {
    id: address.id,
    fullName: address.fullName,
    phone: address.phone,
    line1: address.addressLine1,
    line2: address.addressLine2 || "",
    city: address.city,
    state: address.state,
    postalCode: address.postalCode,
    country: address.country,
    addressType: address.addressType,
    isDefault: address.isDefault,
  };
}

export function formToCreatePayload(form, defaults = {}) {
  return {
    fullName: (form.fullName || defaults.fullName || "Customer").trim(),
    phone: (form.phone || defaults.phone || "0000000000").trim(),
    addressLine1: form.line1.trim(),
    addressLine2: form.line2?.trim() || null,
    city: form.city.trim(),
    state: (form.state || "N/A").trim(),
    postalCode: (form.postalCode || "000000").trim(),
    country: form.country.trim(),
    addressType: form.addressType || "HOME",
    isDefault: Boolean(form.isDefault),
  };
}

export function formToUpdatePayload(form, defaults = {}) {
  return {
    fullName: (form.fullName || defaults.fullName)?.trim(),
    phone: (form.phone || defaults.phone)?.trim(),
    addressLine1: form.line1?.trim(),
    addressLine2: form.line2?.trim() || null,
    city: form.city?.trim(),
    state: form.state?.trim(),
    postalCode: form.postalCode?.trim(),
    country: form.country?.trim(),
    addressType: form.addressType,
    isDefault: form.isDefault,
  };
}

export async function fetchUserAddresses() {
  logPersistence("addresses", "GET /addresses");
  const addresses = await getAddresses();
  logPersistence("addresses", "GET /addresses success", { count: addresses.length });
  return addresses.map(apiAddressToUi);
}

export async function createUserAddress(form, defaults) {
  const payload = formToCreatePayload(form, defaults);
  logPersistence("addresses", "POST /addresses", payload);
  const created = await createAddress(payload);
  logPersistence("addresses", "POST /addresses success", { id: created.id });
  return apiAddressToUi(created);
}

export async function updateUserAddress(addressId, form, defaults) {
  const payload = formToUpdatePayload(form, defaults);
  logPersistence("addresses", `PATCH /addresses/${addressId}`, payload);
  const updated = await updateAddress(addressId, payload);
  logPersistence("addresses", "PATCH /addresses success", { id: updated.id });
  return apiAddressToUi(updated);
}

export async function removeUserAddress(addressId) {
  logPersistence("addresses", `DELETE /addresses/${addressId}`);
  await deleteAddress(addressId);
  logPersistence("addresses", "DELETE /addresses success", { id: addressId });
}

export default {
  fetchUserAddresses,
  createUserAddress,
  updateUserAddress,
  removeUserAddress,
  apiAddressToUi,
};
