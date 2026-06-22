import React from "react";
import "./FashionSection.css";
import Card from "../../../components/Newsletter-components/shared/Card/Card.jsx";

// The component now receives a single 'post' object as a prop
const FashionSection = ({ post }) => {
  // Safety check: if no post is passed, don't render anything
  if (!post) {
    return null;
  }

  return (
    <section className="f-section">
      <div className="f-image-container">
        <h2 className="f-title-overlay">FASHION</h2>
        <Card
          imageUrl={post.imageUrl}
          description={post.description}
          publishDate={post.publishDate}
          articleUrl={`/newsletter/article/${post.slug}`}
          location={post.location}
        />
      </div>
    </section>
  );
};

export default FashionSection;
