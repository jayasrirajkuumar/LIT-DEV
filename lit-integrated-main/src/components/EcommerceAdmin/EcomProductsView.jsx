import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Download } from "lucide-react";
import AddProductForm from "./AddProductForm";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import { getProductsPaginated, deleteProduct } from "./productService";
import {
  bulkAdminProducts,
  downloadAdminExport,
  fetchAdminCategories,
} from "../../services/adminApiService";
import {
  AdminPageHeader,
  AdminButton,
  AdminTable,
  AdminBadge,
  AdminStatusBadge,
  AdminInput,
  AdminSelect,
  AdminPagination,
  AdminCheckbox,
  AdminConfirmModal,
} from "../admin-ui";

const SAVED_FILTERS_KEY = "lit-admin-products-filters";

function getCategoryName(product) {
  if (!product?.category) return "—";
  return typeof product.category === "string" ? product.category : product.category.name || "—";
}

function loadSavedFilters() {
  try {
    return JSON.parse(localStorage.getItem(SAVED_FILTERS_KEY) || "null");
  } catch {
    return null;
  }
}

const EcomProductsView = () => {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkAction, setBulkAction] = useState("");
  const [bulkCategoryId, setBulkCategoryId] = useState("");
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = loadSavedFilters();
    if (saved) {
      setSearchQuery(saved.searchQuery || "");
      setStatusFilter(saved.statusFilter || "");
      setCategoryFilter(saved.categoryFilter || "");
      setBrandFilter(saved.brandFilter || "");
      setStockFilter(saved.stockFilter || "");
      setSortBy(saved.sortBy || "newest");
    }
    fetchAdminCategories()
      .then((data) => setCategories(Array.isArray(data) ? data : data.categories ?? []))
      .catch(() => setCategories([]));
  }, []);

  const fetchAndSetProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const filters = {
        page,
        limit: 20,
        sort: sortBy,
      };
      if (searchQuery.trim()) filters.search = searchQuery.trim();
      if (statusFilter) filters.status = statusFilter;
      if (categoryFilter) filters.categoryId = categoryFilter;
      if (brandFilter.trim()) filters.brand = brandFilter.trim();
      if (stockFilter) filters.stockStatus = stockFilter;

      const data = await getProductsPaginated(filters);
      setProducts(data.products ?? []);
      setPagination(data.pagination ?? { page: 1, limit: 20, total: 0, totalPages: 1 });
      setSelectedIds([]);
    } catch (err) {
      setError(err.message || "Failed to load products.");
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, statusFilter, categoryFilter, brandFilter, stockFilter, sortBy]);

  useEffect(() => {
    fetchAndSetProducts();
  }, [fetchAndSetProducts]);

  const saveFilters = () => {
    localStorage.setItem(
      SAVED_FILTERS_KEY,
      JSON.stringify({ searchQuery, statusFilter, categoryFilter, brandFilter, stockFilter, sortBy }),
    );
  };

  const allSelected = useMemo(
    () => products.length > 0 && selectedIds.length === products.length,
    [products, selectedIds],
  );

  const toggleSelectAll = () => {
    setSelectedIds(allSelected ? [] : products.map((p) => p.id));
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const runBulkAction = async () => {
    if (!selectedIds.length || !bulkAction) return;
    setBulkLoading(true);
    try {
      await bulkAdminProducts({
        productIds: selectedIds,
        action: bulkAction,
        categoryId: bulkAction === "changeCategory" ? bulkCategoryId : undefined,
      });
      setBulkConfirmOpen(false);
      setBulkAction("");
      await fetchAndSetProducts();
    } catch (err) {
      setError(err.message || "Bulk action failed.");
    } finally {
      setBulkLoading(false);
    }
  };

  const columns = [
    {
      key: "select",
      label: (
        <AdminCheckbox checked={allSelected} onChange={toggleSelectAll} aria-label="Select all" />
      ),
      width: 40,
      render: (row) => (
        <AdminCheckbox
          checked={selectedIds.includes(row.id)}
          onChange={() => toggleSelect(row.id)}
          onClick={(e) => e.stopPropagation()}
          aria-label={`Select ${row.name}`}
        />
      ),
    },
    {
      key: "product",
      label: "Product",
      render: (row) => (
        <div className="adm-table-product">
          <img
            className="adm-table-product__img"
            src={row.primaryImage || "/placeholder-product.png"}
            alt=""
            loading="lazy"
          />
          <div>
            <div className="adm-table-product__name">{row.name}</div>
            <div className="adm-table-product__meta">{row.sku}</div>
          </div>
        </div>
      ),
    },
    { key: "brand", label: "Brand", render: (row) => row.brand || "—" },
    { key: "category", label: "Category", render: (row) => getCategoryName(row) },
    { key: "price", label: "Price", render: (row) => `₹${row.price}` },
    { key: "stock", label: "Stock", render: (row) => row.stockQuantity ?? 0 },
    {
      key: "status",
      label: "Status",
      render: (row) => <AdminStatusBadge status={row.status} />,
    },
    {
      key: "featured",
      label: "Featured",
      render: (row) =>
        row.isFeatured ? <AdminBadge variant="featured">Featured</AdminBadge> : "—",
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <AdminButton size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); navigate(`${row.id}`); }}>
            View
          </AdminButton>
          <AdminButton size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); navigate(`edit/${row.id}`); }}>
            Edit
          </AdminButton>
          <AdminButton size="sm" variant="danger" onClick={(e) => { e.stopPropagation(); setProductToDelete(row); setIsDeleteModalOpen(true); }}>
            Delete
          </AdminButton>
        </div>
      ),
    },
  ];

  return (
    <div className="adm-page">
      <AdminPageHeader
        title="Product Catalog"
        subtitle="Manage products, pricing, inventory, and publishing"
        actions={
          <>
            <AdminButton
              variant="outline"
              icon={<Download size={16} />}
              onClick={() => downloadAdminExport("/admin/products/export", { sort: sortBy, status: statusFilter, categoryId: categoryFilter, search: searchQuery })}
            >
              Export CSV
            </AdminButton>
            <AdminButton icon={<Plus size={16} />} onClick={() => setIsAddModalOpen(true)}>
              Add Product
            </AdminButton>
          </>
        }
        toolbar={
          <>
            <div className="adm-toolbar-search">
              <Search className="adm-toolbar-search__icon" size={16} />
              <AdminInput
                type="search"
                placeholder="Search name, SKU, brand..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                aria-label="Search products"
              />
            </div>
            <AdminSelect value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} aria-label="Filter by status">
              <option value="">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="DRAFT">Draft</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
              <option value="ARCHIVED">Archived</option>
            </AdminSelect>
            <AdminSelect value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }} aria-label="Filter by category">
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </AdminSelect>
            <AdminInput
              placeholder="Brand"
              value={brandFilter}
              onChange={(e) => { setBrandFilter(e.target.value); setPage(1); }}
              aria-label="Filter by brand"
            />
            <AdminSelect value={stockFilter} onChange={(e) => { setStockFilter(e.target.value); setPage(1); }} aria-label="Filter by stock">
              <option value="">All stock</option>
              <option value="in">In stock</option>
              <option value="low">Low stock</option>
              <option value="out">Out of stock</option>
            </AdminSelect>
            <AdminSelect value={sortBy} onChange={(e) => setSortBy(e.target.value)} aria-label="Sort products">
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="name">Name</option>
              <option value="price_asc">Price ↑</option>
              <option value="price_desc">Price ↓</option>
              <option value="stock">Stock</option>
            </AdminSelect>
            <AdminButton variant="ghost" size="sm" onClick={saveFilters}>Save filters</AdminButton>
          </>
        }
      />

      {selectedIds.length > 0 && (
        <div className="adm-bulk-bar">
          <span>{selectedIds.length} selected</span>
          <AdminSelect value={bulkAction} onChange={(e) => setBulkAction(e.target.value)} aria-label="Bulk action">
            <option value="">Bulk action…</option>
            <option value="archive">Archive</option>
            <option value="enable">Enable</option>
            <option value="disable">Disable</option>
            <option value="feature">Feature</option>
            <option value="unfeature">Unfeature</option>
            <option value="changeCategory">Change category</option>
            <option value="delete">Delete</option>
          </AdminSelect>
          {bulkAction === "changeCategory" && (
            <AdminSelect value={bulkCategoryId} onChange={(e) => setBulkCategoryId(e.target.value)}>
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </AdminSelect>
          )}
          <AdminButton
            size="sm"
            disabled={!bulkAction || (bulkAction === "changeCategory" && !bulkCategoryId)}
            onClick={() => setBulkConfirmOpen(true)}
          >
            Apply
          </AdminButton>
        </div>
      )}

      {error && <div className="adm-alert">{error}</div>}

      <AdminTable
        columns={columns}
        rows={products}
        loading={loading}
        onRowClick={(row) => navigate(`${row.id}`)}
        emptyTitle="No products found"
        emptyDescription="Try adjusting filters or add your first product."
        footer={
          <AdminPagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            onPageChange={setPage}
          />
        }
      />

      <AddProductForm
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onProductAdd={() => {
          setIsAddModalOpen(false);
          fetchAndSetProducts();
        }}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={async () => {
          if (!productToDelete) return;
          try {
            await deleteProduct(productToDelete.id);
            await fetchAndSetProducts();
          } catch {
            window.alert("Failed to delete product.");
          } finally {
            setIsDeleteModalOpen(false);
            setProductToDelete(null);
          }
        }}
        productName={productToDelete?.name}
      />

      <AdminConfirmModal
        open={bulkConfirmOpen}
        onClose={() => setBulkConfirmOpen(false)}
        onConfirm={runBulkAction}
        loading={bulkLoading}
        title="Confirm bulk action"
        description={`Apply "${bulkAction}" to ${selectedIds.length} product(s)?`}
        confirmLabel="Apply"
        variant={bulkAction === "delete" ? "danger" : "primary"}
      />
    </div>
  );
};

export default EcomProductsView;
