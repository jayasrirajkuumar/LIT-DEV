import React, { useState, useEffect } from "react";
import "../styles/EditProductForm.css";

const EditProductForm = ({ isOpen, onClose, productId }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    originalPrice: "",
    discount: "",
    imageUrl: "",
    category: "",
    brand: "",
    rating: "",
    reviews: "",
    sizes: [],
    colors: [],
    stock: "",
    features: [],
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (isOpen && productId) {
      // Fetch product data when modal opens
      fetchProductData();
    }
  }, [isOpen, productId]);

  const fetchProductData = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/products/${productId}`,
      );
      if (!response.ok) throw new Error("Failed to fetch product");
      const data = await response.json();
      setFormData(data);
    } catch (error) {
      setError("Error fetching product data");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleArrayChange = (e, field) => {
    const value = e.target.value.split(",").map((item) => item.trim());
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `http://localhost:5000/api/products/${productId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        },
      );

      if (!response.ok) throw new Error("Failed to update product");

      setSuccess("Product updated successfully!");
      setTimeout(() => {
        onClose();
        window.location.reload(); // Refresh to show updated data
      }, 2000);
    } catch (error) {
      setError("Error updating product");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Edit Product</h2>
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit} className="edit-product-form">
          <div className="form-group">
            <label htmlFor="name">Product Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="price">Price</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="originalPrice">Original Price</label>
              <input
                type="number"
                id="originalPrice"
                name="originalPrice"
                value={formData.originalPrice}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="discount">Discount (%)</label>
            <input
              type="number"
              id="discount"
              name="discount"
              value={formData.discount}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="imageUrl">Image URL</label>
            <input
              type="text"
              id="imageUrl"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <input
                type="text"
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="brand">Brand</label>
              <input
                type="text"
                id="brand"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="rating">Rating</label>
              <input
                type="number"
                id="rating"
                name="rating"
                value={formData.rating}
                onChange={handleChange}
                step="0.1"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="reviews">Number of Reviews</label>
              <input
                type="number"
                id="reviews"
                name="reviews"
                value={formData.reviews}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="sizes">Sizes (comma-separated)</label>
            <input
              type="text"
              id="sizes"
              name="sizes"
              value={formData.sizes.join(", ")}
              onChange={(e) => handleArrayChange(e, "sizes")}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="colors">Colors (comma-separated)</label>
            <input
              type="text"
              id="colors"
              name="colors"
              value={formData.colors.join(", ")}
              onChange={(e) => handleArrayChange(e, "colors")}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="stock">Stock</label>
            <input
              type="number"
              id="stock"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="features">Features (comma-separated)</label>
            <input
              type="text"
              id="features"
              name="features"
              value={formData.features.join(", ")}
              onChange={(e) => handleArrayChange(e, "features")}
              required
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-button">
              Update Product
            </button>
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductForm;
