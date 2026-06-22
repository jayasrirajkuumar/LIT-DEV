// C:/Users/MANASADEVI J/Desktop/LITT-layoutdone/LITT/LIT-Newsletter/frontend/src/components/ShareButtons/ShareButtons.jsx

import React, { useState } from "react";
import "./ShareButtons.css";

// --- Icons (Restored with full, correct SVG paths) ---
const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.39.106-.803.163-1.227.163-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z"></path>
  </svg>
);
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.04C6.5 2.04 2 6.53 2 12.06c0 5.52 4.5 10.02 10 10.02s10-4.5 10-10.02C22 6.53 17.5 2.04 12 2.04zm2.5 7.6h-1.8v-2c0-.55.45-1 1-1h1.3V5.04h-1.9c-2.07 0-3.7 1.63-3.7 3.6v1.96H7.8v2.8h1.6v6.4h2.8v-6.4h1.9l.4-2.8z"></path>
  </svg>
);
const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M6.5 21.5h-5v-13h5v13zM4 6.5C2.5 6.5 1.5 5.3 1.5 4s1-2.5 2.5-2.5c1.4 0 2.5 1.2 2.5 2.5S5.4 6.5 4 6.5zM21.5 21.5h-5v-6.2c0-1.5-.5-2.5-1.9-2.5-1.4 0-2.1 1-2.1 2.5V21.5h-5v-13h5v2.2c.8-1.5 2.1-2.7 4.5-2.7 3.3 0 5.6 2.2 5.6 7v6.5z"></path>
  </svg>
);
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.012 3.584-.07 4.85c-.148 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.85-.07c-3.252-.148-4.771-1.691-4.919-4.919-.058-1.265-.069-1.645-.069-4.85s.012-3.584.07-4.85c.148-3.225 1.664-4.771 4.919-4.919C8.416 2.175 8.796 2.163 12 2.163zm0 1.8c-3.116 0-3.483.01-4.695.068-2.61.12-3.832 1.34-3.952 3.952-.058 1.212-.068 1.578-.068 4.695s.01 3.483.068 4.695c.12 2.61 1.343 3.832 3.952 3.952 1.213.058 1.58.068 4.695.068s3.483-.01 4.695-.068c2.61-.12 3.832-1.343 3.952-3.952.058-1.213.068-1.578.068-4.695s-.01-3.483-.068-4.695c-.12-2.61-1.34-3.832-3.952-3.952C15.483 3.973 15.116 3.963 12 3.963zm0 2.913c-2.734 0-4.95 2.216-4.95 4.95s2.216 4.95 4.95 4.95 4.95-2.216 4.95-4.95-2.216-4.95-4.95-4.95zm0 8.1c-1.758 0-3.15-1.392-3.15-3.15s1.392-3.15 3.15-3.15 3.15 1.392 3.15 3.15-1.392 3.15-3.15 3.15zm4.838-8.415c-.69 0-1.25.56-1.25 1.25s.56 1.25 1.25 1.25 1.25-.56 1.25-1.25-.56-1.25-1.25-1.25z"></path>
  </svg>
);

const ShareButtons = ({ articleTitle }) => {
  const [copySuccess, setCopySuccess] = useState("");
  const fullUrlToShare = window.location.href;

  const twitterShareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(fullUrlToShare)}&text=${encodeURIComponent(articleTitle)}`;
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrlToShare)}`;
  const linkedinShareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(fullUrlToShare)}&title=${encodeURIComponent(articleTitle)}`;

  const handleCopyToClipboard = (e) => {
    e.preventDefault();
    navigator.clipboard.writeText(fullUrlToShare).then(
      () => {
        setCopySuccess("Link Copied!");
        setTimeout(() => setCopySuccess(""), 2000);
      },
      () => {
        setCopySuccess("Failed to copy.");
        setTimeout(() => setCopySuccess(""), 2000);
      },
    );
  };

  return (
    <div className="share-buttons-container">
      <span className="share-label">SHARE:</span>
      <a
        href={twitterShareUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="share-icon"
      >
        <TwitterIcon />
      </a>
      <a
        href={facebookShareUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="share-icon"
      >
        <FacebookIcon />
      </a>
      <a
        href={linkedinShareUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="share-icon"
      >
        <LinkedInIcon />
      </a>

      <button
        onClick={handleCopyToClipboard}
        className="share-icon instagram-button"
        title="Copy link for Instagram"
      >
        <InstagramIcon />
      </button>

      {copySuccess && <span className="copy-feedback">{copySuccess}</span>}
    </div>
  );
};

export default ShareButtons;
