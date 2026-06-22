import React, { useState, useEffect } from "react";
import "../styles/DeleteProductForm.css";

const DeleteProductForm = ({ isOpen, onClose }) => {
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetch("http://localhost:5000/api/products")
        .then((res) => res.json())
        .then((data) => setProducts(data))
        .catch(() => setProducts([]));
      setSelectedProductId("");
      setError("");
      setSuccess("");
    }
  }, [isOpen]);

  const handleDelete = async () => {
    if (!selectedProductId) {
      setError("Please select a product to delete.");
      return;
    }
    setIsDeleting(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetch(
        `http://localhost:5000/api/products/${selectedProductId}`,
        {
          method: "DELETE",
        },
      );
      if (!response.ok) throw new Error("Failed to delete product");
      setSuccess("Product deleted successfully!");
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 2000);
    } catch (error) {
      setError("Error deleting product");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content delete-modal">
        <div className="modal-header">
          <h2>Delete Product</h2>
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
        </div>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        <div className="delete-confirmation">
          <label htmlFor="product-select">Select a product to delete:</label>
          <select
            id="product-select"
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="product-select-dropdown"
          >
            <option value="">-- Select Product --</option>
            {products.map((product) => (
              <option key={product._id} value={product._id}>
                {product.name}
              </option>
            ))}
          </select>
          <p className="warning-text">This action cannot be undone.</p>
        </div>
        <div className="form-actions">
          <button
            type="button"
            className="delete-button"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Product"}
          </button>
          <button
            type="button"
            className="cancel-button"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteProductForm;
