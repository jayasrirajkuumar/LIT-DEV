import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { FaEye, FaPen, FaTrash, FaPlus } from "react-icons/fa";
import "./ArticleList.css";

const formatTitle = (slug) => {
  if (!slug) return "";
  return slug.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
};

const ArticleListPage = () => {
  const { section, type, category } = useParams();
  const navigate = useNavigate();

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState("");

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError(null);

      let endpoint = "";
      const normalizedLocation = type.charAt(0).toUpperCase() + type.slice(1);

      if (section === "mail") {
        endpoint = `/api/articles/category/${category}`;
      } else {
        endpoint = `/api/articles/category/${category}/location/${normalizedLocation}`;
      }

      const response = await fetch(`http://localhost:5000${endpoint}`);
      if (!response.ok) throw new Error(`Error: ${response.statusText}`);

      const data = await response.json();
      setArticles(data || []);
    } catch (err) {
      setError(err.message || "Failed to fetch articles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [section, type, category]);

  const handleDelete = async (slug, title) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${title}"?`,
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/articles/slug/${slug}`,
        {
          method: "DELETE",
        },
      );

      if (!res.ok) throw new Error("Failed to delete article");

      setArticles((prev) => prev.filter((article) => article.slug !== slug));
      showToast(`✅ "${title}" deleted successfully`);
    } catch (err) {
      showToast(`❌ ${err.message}`);
    }
  };

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(""), 3000);
  };

  const basePath = `/admin/articles/${section}/${type}/${category}`;
  const pageTitle = `${formatTitle(category)} Articles`;

  return (
    <div className="list-page-container">
      <header className="list-page-header">
        <h1>{pageTitle}</h1>
        <Link to={`${basePath}/new`} className="create-btn">
          <FaPlus /> Create New Article
        </Link>
      </header>

      {toast && <div className="toast-message">{toast}</div>}

      <div className="list-table-container">
        {loading ? (
          <p style={{ color: "white" }}>Loading...</p>
        ) : error ? (
          <p style={{ color: "red" }}>{error}</p>
        ) : articles.length > 0 ? (
          <table className="content-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Publish Date</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr key={article._id}>
                  <td>{article.title}</td>
                  <td>{article.category}</td>
                  <td>{article.publishDate}</td>
                  <td>
                    <span
                      className={`status-pill ${article.status?.toLowerCase()}`}
                    >
                      {article.status || "Draft"}
                    </span>
                  </td>
                  <td className="action-cell">
                    <a
                      onClick={() => navigate(`/admin/article/${article.slug}`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="action-icon view"
                      title="View"
                    >
                      <FaEye />
                    </a>
                    <button
                      onClick={() =>
                        navigate(`${basePath}/edit/${article.slug}`)
                      }
                      className="action-icon edit"
                      title="Edit"
                    >
                      <FaPen />
                    </button>
                    <button
                      onClick={() => handleDelete(article.slug, article.title)}
                      className="action-icon delete"
                      title="Delete"
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
            <h3>No Articles in this Category</h3>
            <p>Ready to start? Your first article is just a click away.</p>
            <Link to={`${basePath}/new`} className="create-btn">
              <FaPlus /> Create First Article
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticleListPage;
