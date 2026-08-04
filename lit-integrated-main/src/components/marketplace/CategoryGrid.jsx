import React from "react";
import { Link } from "react-router-dom";
import LazyImage from "./LazyImage";

const CategoryGrid = ({ categories }) => (
  <div className="catalog-category-grid">
    {categories.map((category) => (
      <Link
        key={category.slug}
        to={`/shop/category/${category.slug}`}
        className="catalog-category-card"
      >
        <div className="catalog-category-card-image">
          <LazyImage src={category.imageUrl} alt={category.name} />
        </div>
        <div className="catalog-category-card-body">
          <h3>{category.name}</h3>
          <p>{category.description}</p>
        </div>
      </Link>
    ))}
  </div>
);

export default CategoryGrid;
