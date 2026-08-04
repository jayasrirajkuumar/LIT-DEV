import React, { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

const FALLBACK_SORT_OPTIONS = [
  { key: "newest", label: "Newest" },
  { key: "popularity", label: "Popularity" },
  { key: "price_asc", label: "Price Low to High" },
  { key: "price_desc", label: "Price High to Low" },
  { key: "discount", label: "Discount" },
  { key: "featured", label: "Featured" },
];

const CatalogToolbar = ({
  total = 0,
  sort,
  onSortChange,
  onToggleFilters,
  showFilterToggle = true,
  sortOptions = [],
}) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const options = sortOptions.length ? sortOptions : FALLBACK_SORT_OPTIONS;

  useEffect(() => {
    const handleClick = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="mp-toolbar">
      <p className="mp-toolbar-count">{total} products</p>
      <div className="mp-toolbar-actions">
        {showFilterToggle && (
          <button type="button" className="mp-btn mp-btn-outline" onClick={onToggleFilters}>
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
          >
            <span>Sort By</span>
            <ChevronDown size={16} className={open ? "is-open" : ""} />
          </button>
          {open && (
            <ul className="mp-sort-dropdown__menu" role="listbox" aria-label="Sort options">
              {options.map((option) => (
                <li key={option.key}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={sort === option.key}
                    className={sort === option.key ? "is-active" : ""}
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
