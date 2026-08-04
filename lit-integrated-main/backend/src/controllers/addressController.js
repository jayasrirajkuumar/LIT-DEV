import {
  listAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
} from "../services/addressService.js";

export async function getAddresses(req, res) {
  const addresses = await listAddresses(req.dbUser.id);

  res.json({
    success: true,
    data: { addresses },
  });
}

export async function getAddress(req, res) {
  const address = await getAddressById(req.dbUser.id, req.validatedParams.id);

  res.json({
    success: true,
    data: { address },
  });
}

export async function postAddress(req, res) {
  const address = await createAddress(req.dbUser.id, req.validatedBody);

  res.status(201).json({
    success: true,
    data: { address },
  });
}

export async function patchAddress(req, res) {
  const address = await updateAddress(
    req.dbUser.id,
    req.validatedParams.id,
    req.validatedBody,
  );

  res.json({
    success: true,
    data: { address },
  });
}

export async function removeAddress(req, res) {
  const address = await deleteAddress(req.dbUser.id, req.validatedParams.id);

  res.json({
    success: true,
    data: { address },
  });
}

export default {
  getAddresses,
  getAddress,
  postAddress,
  patchAddress,
  removeAddress,
};
