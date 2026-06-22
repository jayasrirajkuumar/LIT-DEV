import React from "react";
import "./ArticleBody.css";

const ArticleBody = ({ content }) => {
  return (
    <div
      className="article-body-content"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

export default ArticleBody;
