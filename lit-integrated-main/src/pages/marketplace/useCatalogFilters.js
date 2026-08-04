import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

const DEFAULT_FILTERS = {
  category: "",
  brand: "",
  gender: "",
  kids: "",
  color: "",
  size: "",
  material: "",
  collections: "",
  discount: "",
  rating: "",
  minPrice: "",
  maxPrice: "",
  availability: "all",
  sort: "newest",
  page: 1,
  limit: 12,
};

export function useCatalogFilters(defaults = {}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  const filters = useMemo(() => {
    const page = Number(searchParams.get("page") || defaults.page || DEFAULT_FILTERS.page);
    const limit = Number(searchParams.get("limit") || defaults.limit || DEFAULT_FILTERS.limit);

    return {
      category: searchParams.get("category") || defaults.category || DEFAULT_FILTERS.category,
      brand: searchParams.get("brand") || defaults.brand || DEFAULT_FILTERS.brand,
      gender: searchParams.get("gender") || defaults.gender || DEFAULT_FILTERS.gender,
      kids: searchParams.get("kids") || defaults.kids || DEFAULT_FILTERS.kids,
      color: searchParams.get("color") || defaults.color || DEFAULT_FILTERS.color,
      size: searchParams.get("size") || defaults.size || DEFAULT_FILTERS.size,
      material: searchParams.get("material") || defaults.material || DEFAULT_FILTERS.material,
      collections: searchParams.get("collections") || defaults.collections || DEFAULT_FILTERS.collections,
      discount: searchParams.get("discount") || defaults.discount || DEFAULT_FILTERS.discount,
      rating: searchParams.get("rating") || defaults.rating || DEFAULT_FILTERS.rating,
      minPrice: searchParams.get("minPrice") || defaults.minPrice || DEFAULT_FILTERS.minPrice,
      maxPrice: searchParams.get("maxPrice") || defaults.maxPrice || DEFAULT_FILTERS.maxPrice,
      availability:
        searchParams.get("availability") || defaults.availability || DEFAULT_FILTERS.availability,
      sort: searchParams.get("sort") || defaults.sort || DEFAULT_FILTERS.sort,
      page: Number.isNaN(page) ? 1 : page,
      limit: Number.isNaN(limit) ? 12 : limit,
    };
  }, [searchParams, defaults]);

  const draftKey = JSON.stringify(filters);

  const [draft, setDraft] = useState(filters);

  const syncDraft = useCallback(() => {
    setDraft(filters);
  }, [filters]);

  const applyFilters = useCallback(
    (nextDraft = draft) => {
      const params = new URLSearchParams();
      Object.entries(nextDraft).forEach(([key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
          if (key === "page" && Number(value) === 1) return;
          if (key === "limit" && Number(value) === 12) return;
          if (key === "availability" && value === "all") return;
          if (key === "sort" && value === "newest") return;
          params.set(key, String(value));
        }
      });
      setSearchParams(params);
      setShowFilters(false);
    },
    [draft, setSearchParams],
  );

  const resetFilters = useCallback(() => {
    const reset = {
      ...DEFAULT_FILTERS,
      category: defaults.category || "",
      limit: defaults.limit || DEFAULT_FILTERS.limit,
    };
    setDraft(reset);
    applyFilters(reset);
  }, [applyFilters, defaults.category, defaults.limit]);

  const setPage = useCallback(
    (page) => {
      applyFilters({ ...filters, page });
    },
    [applyFilters, filters],
  );

  const setSort = useCallback(
    (sort) => {
      applyFilters({ ...filters, sort, page: 1 });
    },
    [applyFilters, filters],
  );

  const apiParams = useMemo(() => {
    const params = {
      page: filters.page,
      limit: filters.limit,
      sort: filters.sort === "featured" ? "featured" : filters.sort,
      availability: filters.availability,
    };

    if (filters.category) params.category = filters.category;
    if (filters.brand) params.brand = filters.brand;
    if (filters.minPrice) params.minPrice = filters.minPrice;
    if (filters.maxPrice) params.maxPrice = filters.maxPrice;
    if (filters.collections === "featured" || filters.sort === "featured") {
      params.featured = "true";
    }

    return params;
  }, [filters]);

  const queryKey = JSON.stringify(apiParams);

  return {
    filters,
    draft,
    setDraft,
    draftKey,
    syncDraft,
    applyFilters,
    resetFilters,
    setPage,
    setSort,
    apiParams,
    queryKey,
    showFilters,
    setShowFilters,
  };
}

export default useCatalogFilters;
