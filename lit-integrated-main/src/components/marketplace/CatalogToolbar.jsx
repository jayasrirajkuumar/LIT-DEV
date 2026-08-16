import React, { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { DEFAULT_SORT_OPTIONS, normalizeSortKey } from "../../utils/catalogSort";

const CatalogToolbar = ({
  total = 0,
  sort,
  onSortChange,
  onToggleFilters,
  filtersOpen = false,
  showFilterToggle = true,
  sortOptions = [],
}) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const normalizedSort = normalizeSortKey(sort);

  const options = (sortOptions.length ? sortOptions : DEFAULT_SORT_OPTIONS)
    .filter((option) => option.isActive !== false)
    .map((option) => ({
      ...option,
      key: normalizeSortKey(option.key),
    }));

  const activeLabel = options.find((option) => option.key === normalizedSort)?.label || "Sort By";

  useEffect(() => {
    const handleClick = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const handleKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  return (
    <div className="mp-toolbar">
      <p className="mp-toolbar-count">{total} products</p>
      <div className="mp-toolbar-actions">
        {showFilterToggle && (
          <button
            type="button"
            className={`mp-btn mp-btn-outline mp-filter-toggle-btn ${filtersOpen ? "is-active" : ""}`}
            onClick={onToggleFilters}
            aria-expanded={filtersOpen}
            aria-controls="mp-filters-panel"
          >
            Filter by
          </button>
        )}
        <div className="mp-sort-dropdown" ref={rootRef}>
          <button
            type="button"
            className="mp-sort-dropdown__trigger"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-haspopup="listbox"
            aria-label={`Sort by: ${activeLabel}`}
          >
            <span>{activeLabel}</span>
            <ChevronDown size={16} className={open ? "is-open" : ""} aria-hidden="true" />
          </button>
          {open && (
            <ul className="mp-sort-dropdown__menu" role="listbox" aria-label="Sort options">
              {options.map((option) => (
                <li key={option.key}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={normalizedSort === option.key}
                    className={normalizedSort === option.key ? "is-active" : ""}
                    onClick={() => {
                      onSortChange(option.key);
                      setOpen(false);
                    }}
                  >
                    {option.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default CatalogToolbar;
