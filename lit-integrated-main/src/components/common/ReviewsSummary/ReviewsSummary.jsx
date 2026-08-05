import React from "react";

const Star = ({ filled }) => (
  <span className={filled ? "text-amber-400" : "text-slate-300"} aria-hidden="true">★</span>
);

// Example: <ReviewsSummary rating={4.5} reviewCount={125} />
const ReviewsSummary = ({ rating = 0, reviewCount = 0 }) => {
  const fullStars = Math.floor(rating);
  const handleScrollToReviews = () => {
    // We'll implement this later when the reviews section exists
    // const reviewsSection = document.getElementById('reviews-section');
    // if (reviewsSection) reviewsSection.scrollIntoView({ behavior: 'smooth' });
    alert("Scrolling to reviews section (to be implemented)");
  };

  return (
    <button type="button" className="mb-4 flex max-w-full items-center gap-2 rounded-md bg-transparent p-0 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600" onClick={handleScrollToReviews}>
      <span className="flex shrink-0 text-xl" aria-label={`${rating} out of 5 stars`}>
        {[...Array(5)].map((_, i) => (
          <Star key={i} filled={i < fullStars} />
        ))}
        {/* Simple implementation, can be improved for half-stars later */}
      </span>
      <span className="truncate text-sm text-slate-600">({reviewCount} reviews)</span>
    </button>
  );
};

export default ReviewsSummary;
