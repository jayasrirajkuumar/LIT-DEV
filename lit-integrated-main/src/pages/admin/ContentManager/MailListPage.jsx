import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "../../../context/DataContext";
import { FaEye, FaPen, FaTrash, FaArrowLeft } from "react-icons/fa";
import "./ContentManager.css";

const MAIL_FILTER_OPTIONS = [
  { id: "all", name: "All" },
  { id: "fast-fashion", name: "Fast Fashion" },
  { id: "luxury-fashion", name: "Luxury Fashion" },
  { id: "sustainable-fashion", name: "Sustainable Fashion" },
  { id: "sneaker-world", name: "Sneaker World" },
];

const MailListPage = () => {
  const navigate = useNavigate();
  const {
    newsletterContent,
    updateNewsletterContent,
    showConfirmation,
    showNotification,
  } = useData();
  const [categoryFilter, setCategoryFilter] = useState("all");

  const flattenedItems = useMemo(() => {
    if (!newsletterContent || !newsletterContent.categories) return [];
    const allItems = Object.entries(newsletterContent.categories).flatMap(
      ([categoryId, items]) =>
        items.map((item) => ({
          ...item,
          categoryId: categoryId,
          categoryName:
            MAIL_FILTER_OPTIONS.find((c) => c.id === categoryId)?.name ||
            categoryId,
        })),
    );
    if (categoryFilter === "all") return allItems;
    return allItems.filter((item) => item.categoryId === categoryFilter);
  }, [newsletterContent, categoryFilter]);

  const handleView = (item) => {
    if (item.articleUrl)
      window.open(item.articleUrl, "_blank", "noopener,noreferrer");
  };
  const handleEdit = (item) => navigate(`/admin/mail/edit/${item.id}`);
  const handleDelete = (itemToDelete) => {
    showConfirmation(`Delete "${itemToDelete.caption}" permanently?`, () => {
      const updatedContent = { ...newsletterContent };
      const categoryItems = updatedContent.categories[
        itemToDelete.categoryId
      ].filter((item) => item.id !== itemToDelete.id);
      updatedContent.categories[itemToDelete.categoryId] = categoryItems;
      updateNewsletterContent(updatedContent);
      showNotification("Item deleted successfully.");
    });
  };

  return (
    <div className="list-page-container">
      <header className="list-page-header">
        <h1>All Newsletter Items</h1>
        <button
          onClick={() => navigate("/admin/mail")}
          className="back-button-list"
        >
          <FaArrowLeft /> Back to Cards View
        </button>
      </header>
      <div className="filter-bar">
        <div className="filter-group">
          <label>Filter by Category</label>
          <div className="radio-toggle">
            {MAIL_FILTER_OPTIONS.map((cat) => (
              <label
                key={cat.id}
                className={categoryFilter === cat.id ? "active" : ""}
              >
                <input
                  type="radio"
                  name="categoryFilter"
                  value={cat.id}
                  checked={categoryFilter === cat.id}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                />
                <span>{cat.name}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
      <div className="list-table-container">
        {flattenedItems.length > 0 ? (
          <table className="content-table">
            <thead>
              <tr>
                <th>Caption / Headline</th>
                <th>Category</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {flattenedItems.map((item) => (
                <tr key={item.id}>
                  <td className="title-cell">
                    {item.caption || "(No Caption)"}
                  </td>
                  <td>{item.categoryName}</td>
                  <td className="action-cell">
                    <button
                      onClick={() => handleView(item)}
                      className="action-icon view"
                      title="View Article"
                    >
                      <FaEye />
                    </button>
                    <button
                      onClick={() => handleEdit(item)}
                      className="action-icon edit"
                      title="Edit Item"
                    >
                      <FaPen />
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      className="action-icon delete"
                      title="Delete Item"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <h3>No Items Match Your Filters</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default MailListPage;
