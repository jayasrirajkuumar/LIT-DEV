import React, { forwardRef, useState } from "react";
import { ChevronDown, X } from "lucide-react";

const AVAILABILITY_OPTIONS = [
  { value: "all", label: "All" },
  { value: "in_stock", label: "In Stock" },
  { value: "out_of_stock", label: "Out of Stock" },
  { value: "low_stock", label: "Low Stock" },
];

const GENDER_OPTIONS = [
  { value: "", label: "All" },
  { value: "men", label: "Men" },
  { value: "women", label: "Women" },
  { value: "unisex", label: "Unisex" },
];

const DISCOUNT_OPTIONS = [
  { value: "", label: "Any discount" },
  { value: "10", label: "10% or more" },
  { value: "20", label: "20% or more" },
  { value: "30", label: "30% or more" },
  { value: "50", label: "50% or more" },
];

const RATING_OPTIONS = [
  { value: "", label: "Any rating" },
  { value: "4", label: "4★ & up" },
  { value: "3", label: "3★ & up" },
];

function FilterAccordion({ label, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`mp-filter-accordion ${open ? "is-open" : ""}`}>
      <button type="button" className="mp-filter-accordion__trigger" onClick={() => setOpen((v) => !v)}>
        <span>{label}</span>
        <ChevronDown size={16} className={open ? "is-open" : ""} />
      </button>
      {open && <div className="mp-filter-accordion__body">{children}</div>}
    </div>
  );
}

const CatalogFilters = forwardRef(function CatalogFilters(
  {
    categories = [],
    filters,
    onChange,
    onApply,
    onReset,
    onClose,
    lockedCategorySlug = "",
    filterOptions = [],
  },
  ref,
) {
  const handleChange = (field, value) => {
    onChange({ ...filters, [field]: value });
  };

  const activeKeys = new Set(
    filterOptions.length
      ? filterOptions.map((option) => option.key)
      : ["category", "brand", "gender", "kids", "color", "size", "price_range", "discount", "availability", "rating", "material", "collections"],
  );

  const show = (key) => activeKeys.has(key);

  return (
    <aside
      ref={ref}
      className="mp-filters mp-filters--luxury"
      id="mp-filters-panel"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mp-filters-title"
    >
      <div className="mp-filters-header">
        <h3 id="mp-filters-title">Filter by</h3>
        <div className="mp-filters-header__actions">
          <button type="button" className="mp-link-btn" onClick={onReset}>
            Reset
          </button>
          <button
            type="button"
            className="mp-filters-close"
            onClick={onClose}
            aria-label="Close filters"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
      </div>

      {!lockedCategorySlug && show("category") && (
        <FilterAccordion label="Category">
          <select
            id="mp-category"
            value={filters.category}
            onChange={(event) => handleChange("category", event.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </FilterAccordion>
      )}

      {show("brand") && (
        <FilterAccordion label="Brand" defaultOpen>
          <input
            id="mp-brand"
            type="search"
            placeholder="Type designer name here"
            value={filters.brand}
            onChange={(event) => handleChange("brand", event.target.value)}
          />
        </FilterAccordion>
      )}

      {show("gender") && (
        <FilterAccordion label="Gender">
          <select value={filters.gender} onChange={(e) => handleChange("gender", e.target.value)}>
            {GENDER_OPTIONS.map((option) => (
              <option key={option.value || "all"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FilterAccordion>
      )}

      {show("kids") && (
        <FilterAccordion label="Kids">
          <label className="mp-filter-toggle">
            <input
              type="checkbox"
              checked={filters.kids === "true"}
              onChange={(e) => handleChange("kids", e.target.checked ? "true" : "")}
            />
            Kids only
          </label>
        </FilterAccordion>
      )}

      {show("color") && (
        <FilterAccordion label="Color">
          <input
            type="text"
            placeholder="e.g. Black, Ivory"
            value={filters.color}
            onChange={(e) => handleChange("color", e.target.value)}
          />
        </FilterAccordion>
      )}

      {show("size") && (
        <FilterAccordion label="Size">
          <select value={filters.size} onChange={(e) => handleChange("size", e.target.value)}>
            <option value="">All sizes</option>
            {["XS", "S", "M", "L", "XL", "XXL"].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </FilterAccordion>
      )}

      {show("price_range") && (
        <FilterAccordion label="Price">
          <div className="mp-filter-row">
            <input
              type="number"
              min="0"
              placeholder="Min"
              value={filters.minPrice}
              onChange={(event) => handleChange("minPrice", event.target.value)}
            />
            <input
              type="number"
              min="0"
              placeholder="Max"
              value={filters.maxPrice}
              onChange={(event) => handleChange("maxPrice", event.target.value)}
            />
          </div>
        </FilterAccordion>
      )}

      {show("discount") && (
        <FilterAccordion label="Discount">
          <select value={filters.discount} onChange={(e) => handleChange("discount", e.target.value)}>
            {DISCOUNT_OPTIONS.map((option) => (
              <option key={option.value || "any"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FilterAccordion>
      )}

      {show("availability") && (
        <FilterAccordion label="Availability">
          <select
            value={filters.availability}
            onChange={(event) => handleChange("availability", event.target.value)}
          >
            {AVAILABILITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FilterAccordion>
      )}

      {show("rating") && (
        <FilterAccordion label="Rating">
          <select value={filters.rating} onChange={(e) => handleChange("rating", e.target.value)}>
            {RATING_OPTIONS.map((option) => (
              <option key={option.value || "any"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FilterAccordion>
      )}

      {show("material") && (
        <FilterAccordion label="Material">
          <input
            type="text"
            placeholder="e.g. Silk, Leather"
            value={filters.material}
            onChange={(e) => handleChange("material", e.target.value)}
          />
        </FilterAccordion>
      )}

      {show("collections") && (
        <FilterAccordion label="Collections">
          <select value={filters.collections} onChange={(e) => handleChange("collections", e.target.value)}>
            <option value="">All collections</option>
            <option value="fresh-arrivals">Fresh Arrivals</option>
            <option value="featured">Featured</option>
            <option value="sale">Sale</option>
          </select>
        </FilterAccordion>
      )}

      <button type="button" className="mp-btn mp-btn-primary mp-filter-apply" onClick={onApply}>
        Apply Filters
      </button>
    </aside>
  );
});

CatalogFilters.displayName = "CatalogFilters";

export default CatalogFilters;
