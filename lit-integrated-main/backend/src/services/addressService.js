import { AppError } from "../utils/AppError.js";
import { addressRepository } from "../repositories/addressRepository.js";
import { logger } from "../utils/logger.js";

export async function listAddresses(userId) {
  return addressRepository.findAllByUserId(userId);
}

export async function getAddressById(userId, addressId) {
  const address = await addressRepository.findByIdForUser(addressId, userId);

  if (!address) {
    throw new AppError("Address not found.", 404, "ADDRESS_NOT_FOUND");
  }

  return addressRepository.toPublicAddress(address);
}

export async function createAddress(userId, data) {
  const address = await addressRepository.create(userId, data);
  logger.debug("Database update: address created", { userId, addressId: address.id });
  return address;
}

export async function updateAddress(userId, addressId, data) {
  const updated = await addressRepository.update(addressId, userId, data);

  if (!updated) {
    throw new AppError("Address not found.", 404, "ADDRESS_NOT_FOUND");
  }

  logger.debug("Database update: address updated", { userId, addressId });
  return updated;
}

export async function deleteAddress(userId, addressId) {
  const deleted = await addressRepository.delete(addressId, userId);

  if (!deleted) {
    throw new AppError("Address not found.", 404, "ADDRESS_NOT_FOUND");
  }

  logger.debug("Database update: address deleted", { userId, addressId });
  return deleted;
}

export default {
  listAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
};
