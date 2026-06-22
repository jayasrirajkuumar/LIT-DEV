import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import { v4 as uuidv4 } from "uuid";

const DataContext = createContext(null);

const MOCK_DATA = [
  {
    id: uuidv4(),
    slug: "sustainable-denim-revival",
    title: "The Sustainable Denim Revival",
    description:
      "Exploring eco-friendly denim manufacturing and its impact on the fashion industry.",
    bodyContent:
      "<p>Denim is a timeless staple, but its traditional production is resource-intensive. This article delves into the innovative brands and technologies making denim sustainable.</p>",
    imageUrl:
      "https://images.unsplash.com/photo-1593030103066-0424a66164a4?q=80&w=2070",
    category: "SustainableFashion",
    location: "Domestic",
    publishDate: "2024-06-15",
    status: "Published",
    section: "website",
  },
  {
    id: uuidv4(),
    slug: "luxury-watch-trends-2024",
    title: "Luxury Watch Trends for 2024",
    description:
      "What to look for in high-end timepieces this year, from materials to movements.",
    bodyContent:
      "<p>From vintage revivals to cutting-edge complications, the world of luxury watches is ever-evolving. We explore the key trends collectors should watch for.</p>",
    imageUrl:
      "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=2080",
    category: "LuxuryFashion",
    location: "International",
    publishDate: "2024-06-12",
    status: "Published",
    section: "website",
  },
  {
    id: uuidv4(),
    slug: "sneaker-culture-impact",
    title: "Sneaker Culture's Impact",
    description:
      "How sneakers transcended sportswear to become a multi-billion dollar cultural phenomenon.",
    bodyContent:
      "<p>This is placeholder content for the sneaker culture article. This content is for the mail section.</p>",
    imageUrl:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070",
    category: "SneakerWorld",
    location: "all",
    publishDate: "2024-06-10",
    status: "Draft",
    section: "mail",
  },
];

const DEFAULT_NEWSLETTER_CONTENT = {
  generalContent: {
    fashionFact: "Did you know that the modern zipper was invented in 1913?",
  },
  categories: {
    "fast-fashion": [
      {
        id: `item-fast-fashion-${Date.now()}`,
        caption: "",
        articleUrl: "",
        imageUrl: "",
      },
    ],
    "luxury-fashion": [
      {
        id: `item-luxury-fashion-${Date.now()}`,
        caption: "",
        articleUrl: "",
        imageUrl: "",
      },
    ],
    "sustainable-fashion": [
      {
        id: `item-sustainable-fashion-${Date.now()}`,
        caption: "",
        articleUrl: "",
        imageUrl: "",
      },
    ],
    "sneaker-world": [
      {
        id: `item-sneaker-world-${Date.now()}`,
        caption: "",
        articleUrl: "",
        imageUrl: "",
      },
    ],
  },
};

export const DataProvider = ({ children }) => {
  const [articles, setArticles] = useState(() => {
    const saved = localStorage.getItem("cmsArticles");
    return saved ? JSON.parse(saved) : MOCK_DATA;
  });

  const [newsletterContent, setNewsletterContent] = useState(() => {
    const saved = localStorage.getItem("newsletterContent");
    return saved ? JSON.parse(saved) : DEFAULT_NEWSLETTER_CONTENT;
  });

  const [notification, setNotification] = useState(null);
  const [confirmation, setConfirmation] = useState(null);

  useEffect(() => {
    localStorage.setItem("cmsArticles", JSON.stringify(articles));
  }, [articles]);

  useEffect(() => {
    localStorage.setItem(
      "newsletterContent",
      JSON.stringify(newsletterContent),
    );
  }, [newsletterContent]);

  const showNotification = useCallback((message) => {
    setNotification({ message });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const showConfirmation = useCallback((message, onConfirm) => {
    setConfirmation({ message, onConfirm });
  }, []);

  const hideConfirmation = () => setConfirmation(null);

  const handleConfirm = () => {
    if (confirmation?.onConfirm) confirmation.onConfirm();
    hideConfirmation();
  };

  const getArticleBySlug = (slug) => {
    return articles.find((a) => a.slug === slug);
  };

  const addArticle = (articleData) => {
    const newArticle = {
      ...articleData,
      id: uuidv4(),
      publishDate: new Date().toISOString().split("T")[0],
    };
    setArticles((prev) => [newArticle, ...prev]);
  };

  const updateArticle = (slug, updatedData) => {
    setArticles((prev) =>
      prev.map((a) => (a.slug === slug ? { ...a, ...updatedData } : a)),
    );
  };

  const deleteArticle = (slug) => {
    setArticles((prev) => prev.filter((a) => a.slug !== slug));
  };

  const updateNewsletterContent = (newContent) => {
    setNewsletterContent(newContent);
  };

  const value = {
    articles,
    getArticleBySlug,
    addArticle,
    updateArticle,
    deleteArticle,
    showNotification,
    showConfirmation,

    newsletterContent,
    updateNewsletterContent,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
      {notification && (
        <AlertBox
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
      {confirmation && (
        <ConfirmationBox
          message={confirmation.message}
          onConfirm={handleConfirm}
          onCancel={hideConfirmation}
        />
      )}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);

const AlertBox = ({ message, onClose }) => (
  <div className="notification-overlay">
    <div className="notification-box">
      <p>{message}</p>
      <button onClick={onClose} className="notification-btn">
        OK
      </button>
    </div>
  </div>
);

const ConfirmationBox = ({ message, onConfirm, onCancel }) => (
  <div className="notification-overlay">
    <div className="notification-box confirmation-box">
      <p>{message}</p>
      <div className="confirmation-actions">
        <button onClick={onCancel} className="confirmation-btn cancel-btn">
          Cancel
        </button>
        <button onClick={onConfirm} className="confirmation-btn confirm-btn">
          Confirm
        </button>
      </div>
    </div>
  </div>
);
