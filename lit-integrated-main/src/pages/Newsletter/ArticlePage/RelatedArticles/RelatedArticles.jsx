import React from "react";
import "./RelatedArticles.css";
// Import the shared Card component from its correct location
import Card from "../../../../components/Newsletter-components/shared/Card/Card.jsx";

const RelatedArticles = ({ articles }) => {
  return (
    <section className="related-articles-section">
      <h2 className="related-title">Related Newsletters</h2>
      <div className="related-grid">
        {articles.map((article, index) => (
          <Card
            key={index}
            imageUrl={article.imageUrl}
            articleUrl={`/newsletter/article/${article.slug}`}
            text={article.title}
            // slug={article.slug} // <-- Pass the slug instead
          />
        ))}
      </div>
    </section>
  );
};

export default RelatedArticles;
