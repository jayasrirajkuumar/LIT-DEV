import React from "react";

function formatErrorMessage(message) {
  if (!message) return "We couldn't load the marketplace right now.";
  if (message === "500" || message === "Request failed with status 500") {
    return "Our servers are temporarily unavailable. Please try again.";
  }
  return message;
}

const ErrorState = ({ message, onRetry }) => (
  <div className="mp-error-state">
    <h3>Something went wrong</h3>
    <p>{formatErrorMessage(message)}</p>
    {onRetry && (
      <button type="button" className="lit-btn lit-btn--primary" onClick={onRetry}>
        Try Again
      </button>
    )}
  </div>
);

export default ErrorState;
