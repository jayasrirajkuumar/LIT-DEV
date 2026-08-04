import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import BackNavigation from "../components/layout/BackNavigation";
import { useUserAuth } from "../hooks/useUserAuth";
import { useShopping } from "../context/ShoppingContext";
import { formatCatalogPrice } from "../utils/catalogFormat";
import {
  createWishlistCollection,
  updateWishlistCollection,
  deleteWishlistCollection,
  setDefaultWishlistCollection,
  moveWishlistItemCollection,
  copyWishlistItemCollection,
} from "../services/shoppingApiService";
import "../styles/Wishlist.css";
import "../styles/marketplace.css";

const Wishlist = () => {
  const { isAuthenticated } = useUserAuth();
  const { wishlist, loading, refreshShopping, removeFromWishlist, moveWishlistItemToCart } = useShopping();
  const collections = wishlist?.collections ?? [];
  const [selectedId, setSelectedId] = useState("");
  const [newCollectionName, setNewCollectionName] = useState("");
  const [renameId, setRenameId] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [moveProductId, setMoveProductId] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!selectedId && collections.length) {
      const defaultCollection = collections.find((c) => c.isDefault) ?? collections[0];
      setSelectedId(defaultCollection.id);
    }
  }, [collections, selectedId]);

  const selectedCollection = useMemo(
    () => collections.find((c) => c.id === selectedId) ?? collections[0],
    [collections, selectedId],
  );

  const items = selectedCollection?.items ?? [];

  const runAction = async (action) => {
    try {
      setBusy(true);
      await action();
      await refreshShopping();
    } catch (err) {
      window.dispatchEvent(new CustomEvent("lit-toast", { detail: { message: err.message || "Action failed." } }));
    } finally {
      setBusy(false);
    }
  };

  const handleCreateCollection = () => {
    if (!newCollectionName.trim()) return;
    runAction(async () => {
      await createWishlistCollection(newCollectionName.trim());
      setNewCollectionName("");
    });
  };

  const handleRename = (collectionId) => {
    if (!renameValue.trim()) return;
    runAction(async () => {
      await updateWishlistCollection(collectionId, { name: renameValue.trim() });
      setRenameId(null);
      setRenameValue("");
    });
  };

  const handleDelete = (collectionId) => {
    if (!window.confirm("Delete this collection? Items in other collections are kept.")) return;
    runAction(async () => {
      await deleteWishlistCollection(collectionId);
      if (selectedId === collectionId) setSelectedId("");
    });
  };

  const handleSetDefault = (collectionId) => {
    runAction(() => setDefaultWishlistCollection(collectionId));
  };

  const handleMoveOrCopy = (targetCollectionId, mode) => {
    if (!moveProductId) return;
    runAction(async () => {
      if (mode === "move") {
        await moveWishlistItemCollection(moveProductId, targetCollectionId);
      } else {
        await copyWishlistItemCollection(moveProductId, targetCollectionId);
      }
      setMoveProductId(null);
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="wishlist-page">
        <div className="wishlist-container">
          <BackNavigation label="Back to Marketplace" fallbackTo="/shop" />
          <h1 className="wishlist-title">Your Wishlist</h1>
          <p>Sign in to save and manage your favorite pieces.</p>
          <Link to="/shop" className="shopping-cart-cta">
            Explore the Marketplace
          </Link>
        </div>
      </div>
    );
  }

  if (loading && !wishlist) {
    return (
      <div className="wishlist-page">
        <div className="wishlist-container">
          <div className="lit-loading">
            <div className="lit-spinner" aria-hidden="true" />
            <p>Loading your wishlist...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <div className="wishlist-container">
        <BackNavigation label="Back to Marketplace" fallbackTo="/shop" />
        <h1 className="wishlist-title">Your Collections</h1>

        <div className="wishlist-layout">
          <aside className="wishlist-collections">
            <div className="wishlist-collections__create">
              <input
                type="text"
                placeholder="New collection"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
              />
              <button type="button" className="mp-add-to-cart" disabled={busy} onClick={handleCreateCollection}>
                Create
              </button>
            </div>

            <ul className="wishlist-collections__list">
              {collections.map((collection) => (
                <li key={collection.id}>
                  <button
                    type="button"
                    className={`wishlist-collections__item${selectedId === collection.id ? " active" : ""}`}
                    onClick={() => setSelectedId(collection.id)}
                  >
                    <span>{collection.name}</span>
                    <small>{collection.itemCount ?? collection.items?.length ?? 0}</small>
                  </button>
                  {renameId === collection.id ? (
                    <div className="wishlist-collections__rename">
                      <input value={renameValue} onChange={(e) => setRenameValue(e.target.value)} />
                      <button type="button" onClick={() => handleRename(collection.id)} disabled={busy}>
                        Save
                      </button>
                    </div>
                  ) : (
                    <div className="wishlist-collections__actions">
                      <button
                        type="button"
                        onClick={() => {
                          setRenameId(collection.id);
                          setRenameValue(collection.name);
                        }}
                      >
                        Rename
                      </button>
                      {!collection.isDefault && (
                        <>
                          <button type="button" onClick={() => handleSetDefault(collection.id)} disabled={busy}>
                            Set Default
                          </button>
                          <button type="button" onClick={() => handleDelete(collection.id)} disabled={busy}>
                            Delete
                          </button>
                        </>
                      )}
                      {collection.isDefault && <span className="wishlist-collections__default">Default</span>}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </aside>

          <section className="wishlist-main">
            <h2 className="wishlist-main__title">{selectedCollection?.name || "Collection"}</h2>

            {!items.length ? (
              <div className="empty-wishlist">
                <p>This collection is empty.</p>
                <Link to="/shop">Continue Shopping</Link>
              </div>
            ) : (
              <div className="wishlist-grid">
                {items.map((item) => {
                  const product = item.product;
                  const image = product.primaryImage || product.images?.[0]?.imageUrl;
                  return (
                    <motion.article
                      key={item.id}
                      className="wishlist-item"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Link to={`/shop/product/${product.slug}`} className="wishlist-item-image">
                        {image ? <img src={image} alt={product.name} /> : <span>LIT</span>}
                      </Link>
                      <div className="wishlist-item-info">
                        <Link to={`/shop/product/${product.slug}`}>
                          <p className="mp-brand-name">{product.brand}</p>
                          <h3>{product.name}</h3>
                        </Link>
                        <p className="mp-current-price">
                          {formatCatalogPrice(product.price, product.currency)}
                        </p>
                        <div className="wishlist-item-actions">
                          <button
                            type="button"
                            className="mp-add-to-cart"
                            onClick={() => moveWishlistItemToCart(product.id, 1)}
                          >
                            Move to Cart
                          </button>
                          <button
                            type="button"
                            className="shopping-cart-link-btn"
                            onClick={() => setMoveProductId(product.id)}
                          >
                            Move / Copy
                          </button>
                          <button
                            type="button"
                            className="shopping-cart-link-btn"
                            onClick={() => removeFromWishlist(product.id)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </motion.article>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {moveProductId && (
          <div className="wishlist-move-overlay" onClick={() => setMoveProductId(null)} role="presentation">
            <div className="wishlist-move-dialog" onClick={(e) => e.stopPropagation()}>
              <h3>Move or copy to collection</h3>
              <div className="wishlist-move-options">
                {collections
                  .filter((c) => c.id !== selectedId)
                  .map((collection) => (
                    <div key={collection.id} className="wishlist-move-row">
                      <span>{collection.name}</span>
                      <div>
                        <button type="button" onClick={() => handleMoveOrCopy(collection.id, "move")} disabled={busy}>
                          Move
                        </button>
                        <button type="button" onClick={() => handleMoveOrCopy(collection.id, "copy")} disabled={busy}>
                          Copy
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
              <button type="button" className="shopping-cart-link-btn" onClick={() => setMoveProductId(null)}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
