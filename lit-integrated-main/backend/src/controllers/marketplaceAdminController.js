import {
  getMarketplacePublicConfig,
  listAnnouncements,
  listBrands,
  createBrand,
  updateBrand,
  deleteBrand,
  upsertAnnouncement,
  deleteAnnouncement,
  listSortOptions,
  listFilterOptions,
  upsertSortOption,
  upsertFilterOption,
  listAdminCarts,
  listAdminWishlists,
} from "../services/marketplaceConfigService.js";
import { listUserCoupons } from "../services/couponService.js";

export async function getAdminMarketplaceConfig(_req, res) {
  const config = await getMarketplacePublicConfig();
  const [announcements, brands, sortOptions, filterOptions] = await Promise.all([
    listAnnouncements(false),
    listBrands(false),
    listSortOptions(false),
    listFilterOptions(false),
  ]);
  res.json({
    success: true,
    data: { ...config, announcements, brands, sortOptions, filterOptions },
  });
}

export async function postAnnouncement(req, res) {
  const row = await upsertAnnouncement(null, req.body);
  res.status(201).json({ success: true, data: { announcement: row } });
}

export async function patchAnnouncement(req, res) {
  const row = await upsertAnnouncement(req.params.id, req.body);
  res.json({ success: true, data: { announcement: row } });
}

export async function removeAnnouncement(req, res) {
  await deleteAnnouncement(req.params.id);
  res.json({ success: true, data: { deleted: true } });
}

export async function postBrand(req, res) {
  const brand = await createBrand(req.body);
  res.status(201).json({ success: true, data: { brand } });
}

export async function patchBrand(req, res) {
  const brand = await updateBrand(req.params.id, req.body);
  res.json({ success: true, data: { brand } });
}

export async function removeBrand(req, res) {
  await deleteBrand(req.params.id);
  res.json({ success: true, data: { deleted: true } });
}

export async function patchSortOption(req, res) {
  const option = await upsertSortOption(req.params.id, req.body);
  res.json({ success: true, data: { sortOption: option } });
}

export async function patchFilterOption(req, res) {
  const option = await upsertFilterOption(req.params.id, req.body);
  res.json({ success: true, data: { filterOption: option } });
}

export async function getAdminCarts(_req, res) {
  const carts = await listAdminCarts();
  res.json({ success: true, data: { carts } });
}

export async function getAdminWishlistItems(_req, res) {
  const items = await listAdminWishlists();
  res.json({ success: true, data: { items } });
}

export async function getUserCoupons(req, res) {
  const coupons = await listUserCoupons(req.dbUser.id);
  res.json({ success: true, data: { coupons } });
}

export default {
  getAdminMarketplaceConfig,
  postAnnouncement,
  patchAnnouncement,
  removeAnnouncement,
  postBrand,
  patchBrand,
  removeBrand,
  patchSortOption,
  patchFilterOption,
  getAdminCarts,
  getAdminWishlistItems,
  getUserCoupons,
};
