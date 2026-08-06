import React from "react";
import { Link } from "react-router-dom";
import "./JoinCommunity.css";
import joinCommunityBg from "../../assets/join-community-bg.mp4";

const JoinCommunity = () => {

  return (
    <section className="join-community min-h-dvh w-full">
      <div className="video-container">
        <video autoPlay muted loop playsInline className="background-video">
          <source src={joinCommunityBg} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="overlay"></div>
      </div>

      <div className="join-community-container">
        <div className="content">
          <h1 id="join-community-title">Join our Community</h1>
          <p>
            Join our exclusive community! Be the first to know about the latest
            releases, market trends, exciting launches, and special offers. Stay
            ahead, Stay LIT.
          </p>

          <div className="join-community-button-container">
            {/* This anchor link is fine because it points to an ID on the same page */}
            <a href="#footer-community-section" className="cta-button">
              Join our Community
            </a>

            {/* 3. Explore link: use neon-link markup (no outer white border) */}
            <a href="/shop" className="neon-link" aria-label="Explore Marketplace">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span className="button-text">Explore Marketplace</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default JoinCommunity;
