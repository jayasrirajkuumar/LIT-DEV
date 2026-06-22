import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useData } from "../../../context/context-admin/DataContext";
import { FaSave } from "react-icons/fa";
import "../../../styles/styles-admin/Editor.css";

const MailItemEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { newsletterContent, updateNewsletterContent, showNotification } =
    useData();

  const [itemData, setItemData] = useState(null);
  const [originalCategory, setOriginalCategory] = useState(null);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const categories = [
          "fast-fashion",
          "luxury-fashion",
          "sustainable-fashion",
          "sneaker-world",
        ];
        for (const cat of categories) {
          const res = await fetch(`http://localhost:5000/api/${cat}/${id}`);
          if (res.ok) {
            const data = await res.json();
            setItemData({
              caption: data.caption || "",
              url: data.url || "",
              image: data.image || "",
            });
            setOriginalCategory(cat);
            break;
          }
        }
      } catch (err) {
        console.error("Failed to fetch mail article:", err);
      }
    };

    fetchItem();
  }, [id]);

  const handleInputChange = (field, value) => {
    setItemData((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdate = async () => {
    if (!itemData || !originalCategory) return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/${originalCategory}/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            caption: itemData.caption,
            url: itemData.url,
            image: itemData.image,
          }),
        },
      );

      if (!res.ok) throw new Error("Failed to update mail article");

      // Optional: sync with context (in-memory)
      const updatedContent = JSON.parse(JSON.stringify(newsletterContent));
      const list = updatedContent.categories[originalCategory];
      const index = list.findIndex((item) => item._id === id);
      if (index !== -1) {
        list[index] = { ...list[index], ...itemData };
        updateNewsletterContent(updatedContent);
      }

      showNotification("Content updated successfully!");
      navigate("/admin/mail");
    } catch (err) {
      showNotification(err.message || "Update failed", "error");
    }
  };

  if (!itemData) {
    return (
      <div className="editor-container">
        <header className="editor-header purple-theme-header">
          <h1>Loading...</h1>
        </header>
      </div>
    );
  }

  return (
    <div className="editor-container">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleUpdate();
        }}
        className="editor-form"
      >
        <header className="editor-header purple-theme-header">
          <h1>Edit Mail Content</h1>
          <div className="editor-actions">
            <button type="submit" className="action-btn-primary">
              <FaSave /> Update
            </button>
          </div>
        </header>

        <div
          className="editor-main-layout"
          style={{ gridTemplateColumns: "1fr" }}
        >
          <div className="editor-content-area">
            <div className="editor-input-group">
              <label htmlFor="caption">Caption / Headline</label>
              <input
                id="caption"
                type="text"
                value={itemData.caption}
                onChange={(e) => handleInputChange("caption", e.target.value)}
                placeholder="e.g., The Latest Sneaker Drops"
              />
            </div>
            <div className="editor-input-group">
              <label htmlFor="url">Article URL</label>
              <input
                id="url"
                type="url"
                value={itemData.url}
                onChange={(e) => handleInputChange("url", e.target.value)}
                placeholder="https://example.com/article-link"
              />
            </div>
            <div className="editor-input-group">
              <label htmlFor="image">Image URL</label>
              <input
                id="image"
                type="url"
                value={itemData.image}
                onChange={(e) => handleInputChange("image", e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            {itemData.image && (
              <div className="editor-input-group">
                <label>Image Preview</label>
                <img
                  src={itemData.image}
                  alt="Preview"
                  className="image-preview"
                />
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default MailItemEditor;
