import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

const getInitialData = () => {
  try {
    const savedData = localStorage.getItem("cmsContent");
    if (savedData) return JSON.parse(savedData);
  } catch (error) {
    console.error("Failed to parse cmsContent from localStorage", error);
  }

  return {
    website: {
      domestic: {
        "sustainable-fashion": [],
        "luxury-fashion": [],
        "fast-fashion": [],
        "sneaker-world": [],
      },
      international: {
        "sustainable-fashion": [],
        "luxury-fashion": [],
        "fast-fashion": [],
        "sneaker-world": [],
      },
    },
    mail: {
      "sustainable-fashion": [],
      "luxury-fashion": [],
      "fast-fashion": [],
      "sneaker-world": [],
    },
  };
};

export const useArticles = () => {
  const [data, setData] = useState(getInitialData);

  useEffect(() => {
    localStorage.setItem("cmsContent", JSON.stringify(data));
  }, [data]);

  const getArticles = (section, type, category) => {
    if (section === "website") {
      return data.website?.[type]?.[category] || [];
    }
    return data.mail?.[category] || [];
  };

  const getArticleBySlug = (slug) => {
    for (const section in data) {
      if (section === "website") {
        for (const type in data[section]) {
          for (const category in data[section][type]) {
            const article = data[section][type][category].find(
              (a) => a.slug === slug,
            );
            if (article) return article;
          }
        }
      } else {
        // mail
        for (const category in data[section]) {
          const article = data[section][category].find((a) => a.slug === slug);
          if (article) return article;
        }
      }
    }
    return null;
  };

  const addArticle = (section, routeParams, articleData) => {
    const newArticle = {
      ...articleData,
      id: uuidv4(),
      publishDate: new Date().toISOString().split("T")[0],
      status: articleData.status || "Published",
    };
    setData((prev) => {
      const newState = JSON.parse(JSON.stringify(prev));
      if (section === "website") {
        const { type, category } = routeParams;
        if (!newState.website[type]) newState.website[type] = {};
        if (!newState.website[type][category])
          newState.website[type][category] = [];
        newState.website[type][category].unshift(newArticle);
      } else {
        // mail
        const { category } = routeParams;
        if (!newState.mail[category]) newState.mail[category] = [];
        newState.mail[category].unshift(newArticle);
      }
      return newState;
    });
  };

  const updateArticle = (slug, updatedData) => {
    setData((prev) => {
      const newState = JSON.parse(JSON.stringify(prev));
      let found = false;
      for (const section in newState) {
        if (section === "website") {
          for (const type in newState[section]) {
            for (const category in newState[section][type]) {
              const index = newState[section][type][category].findIndex(
                (a) => a.slug === slug,
              );
              if (index !== -1) {
                newState[section][type][category][index] = {
                  ...newState[section][type][category][index],
                  ...updatedData,
                };
                found = true;
                break;
              }
            }
            if (found) break;
          }
        } else {
          for (const category in newState[section]) {
            const index = newState[section][category].findIndex(
              (a) => a.slug === slug,
            );
            if (index !== -1) {
              newState[section][category][index] = {
                ...newState[section][category][index],
                ...updatedData,
              };
              found = true;
              break;
            }
          }
        }
        if (found) break;
      }
      return newState;
    });
  };

  const deleteArticle = (slug) => {
    setData((prev) => {
      const newState = JSON.parse(JSON.stringify(prev));
      for (const section in newState) {
        if (section === "website") {
          for (const type in newState[section]) {
            for (const category in newState[section][type]) {
              newState[section][type][category] = newState[section][type][
                category
              ].filter((a) => a.slug !== slug);
            }
          }
        } else {
          for (const category in newState[section]) {
            newState[section][category] = newState[section][category].filter(
              (a) => a.slug !== slug,
            );
          }
        }
      }
      return newState;
    });
  };

  return {
    getArticles,
    getArticleBySlug,
    addArticle,
    updateArticle,
    deleteArticle,
  };
};
