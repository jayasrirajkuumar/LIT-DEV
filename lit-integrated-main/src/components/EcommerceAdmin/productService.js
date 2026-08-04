import {
  fetchAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  fetchAdminProductById,
} from "../../services/adminApiService";
import { mapFormToApiProduct } from "./productFormMapper";

export const getProducts = async (filters = {}) => {
  const data = await fetchAdminProducts(filters);
  return data.products ?? data;
};

export const getProductsPaginated = async (filters = {}) => fetchAdminProducts(filters);

export const getProductById = async (id) => fetchAdminProductById(id);

export const createProduct = async (formData) =>
  createAdminProduct(mapFormToApiProduct(formData));

export const updateProduct = async (id, formData) =>
  updateAdminProduct(id, mapFormToApiProduct(formData));

export const deleteProduct = async (id) => deleteAdminProduct(id);
