import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  fetchWishlistCollections,
  createWishlistCollection,
  addWishlistToCollection,
} from "../../services/shoppingApiService";

const WishlistCollectionPicker = ({ productId, open, onClose, onSaved }) => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newName, setNewName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !productId) return;
    setLoading(true);
    setError("");
    fetchWishlistCollections()
      .then(setCollections)
      .catch((err) => setError(err.message || "Failed to load collections."))
      .finally(() => setLoading(false));
  }, [open, productId]);

  const handleSelect = async (collectionId) => {
    try {
      setLoading(true);
      await addWishlistToCollection(productId, collectionId);
      onSaved?.();
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save to collection.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      setLoading(true);
      const wishlist = await createWishlistCollection(newName.trim());
      const created = wishlist.collections?.find((c) => c.name === newName.trim());
      if (created) {
        await addWishlistToCollection(productId, created.id);
      }
      onSaved?.();
      onClose();
    } catch (err) {
      setError(err.message || "Failed to create collection.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="auth-modal-backdrop auth-modal-backdrop--premium"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="auth-modal auth-modal--premium collection-picker"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <h2>Save to collection</h2>
          <p className="auth-modal-subtitle">Choose where to save this piece.</p>

          {error && <p className="lit-alert lit-alert--error">{error}</p>}

          <div className="collection-picker__list">
            {loading && collections.length === 0 ? (
              <div className="auth-modal-loading">
                <div className="auth-modal-spinner" />
              </div>
            ) : (
              collections.map((collection) => (
                <button
                  key={collection.id}
                  type="button"
                  className="collection-picker__item"
                  onClick={() => handleSelect(collection.id)}
                  disabled={loading}
                >
                  <span>{collection.name}</span>
                  {collection.isDefault && <small>Default</small>}
                </button>
              ))
            )}
          </div>

          <div className="collection-picker__create">
            <input
              type="text"
              placeholder="New collection name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <button type="button" className="auth-modal-btn secondary" onClick={handleCreate} disabled={loading}>
              Create & Save
            </button>
          </div>

          <button type="button" className="auth-modal-btn ghost" onClick={onClose}>
            Cancel
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WishlistCollectionPicker;
