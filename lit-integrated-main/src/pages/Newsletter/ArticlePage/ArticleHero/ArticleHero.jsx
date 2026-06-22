import React from "react";
import "./ArticleHero.css";

const ArticleHero = ({ headline, description, imageUrl }) => {
  return (
    <section className="article-hero-container">
      <div className="hero-image-wrapper">
        <img src={imageUrl} alt={headline} />
      </div>
      <div className="hero-text-wrapper">
        <h1 className="hero-headline">{headline}</h1>
        <p className="hero-description">{description}</p>
      </div>
    </section>
  );
};

export default ArticleHero;
