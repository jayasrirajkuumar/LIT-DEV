import React from "react";
import "./UnfoldingSoonSection.css";
import avatarStoreIcon from "../../assets/AvatarStore-icon.svg";
import socialPlatformIcon from "../../assets/social-platform-icon.svg";
import irIcon from "../../assets/ir-icon.svg";

const UnfoldingSoonSection = () => {
  return (
    <section
      className="unfolding-soon-container flex min-h-dvh w-full max-w-full flex-col justify-center px-[clamp(1rem,10vw,12rem)] py-16 max-sm:px-4"
      aria-label="Upcoming Features"
    >
      {/* Changed h2 to h1 to match V2 styles */}
      <h1 id="upcoming-features-title">Unfolding Other Verticals Soon</h1>

      <div className="icons-container">
        <div className="section-wrapper">
          <div className="card-description">
            {/* Changed h3 to h2 and removed subtitle class to match V2 styles */}
            <h2>Avatar Store</h2>
            <p>Your Alter Ego Vault</p>
          </div>
          <div className="icon-card-wrapper">
            <div className="icon-card">
              <div className="card-front">
                <img
                  src={avatarStoreIcon}
                  alt="Avatar Store Feature"
                  className="vertical-icon"
                  id="avatar-store-icon"
                />
              </div>
              <div className="card-back">
                <p>
                  The Avatar Store offers virtual collections of clothing,
                  shoes, bags, and accessories to style your personalized avatar
                  with flair.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="section-wrapper">
          <div className="card-description">
            {/* Changed h3 to h2 and removed subtitle class to match V2 styles */}
            <h2>Social Platform</h2>
            <p>Inspire. Engage. Earn.</p>
          </div>
          <div className="icon-card-wrapper">
            <div className="icon-card">
              <div className="card-front">
                <img
                  src={socialPlatformIcon}
                  alt="Social Platform Feature"
                  className="vertical-icon"
                  id="social-platform-icon"
                />
              </div>
              <div className="card-back">
                <p>
                  Serves as a vibrant hub for fashion enthusiasts to sell their
                  collection, share their thoughts and connect with people.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="section-wrapper">
          <div className="card-description">
            {/* Changed h3 to h2 and removed subtitle class to match V2 styles */}
            <h2>IR Platform</h2>
            <p>Your Lens to Instant Shopping</p>
          </div>
          <div className="icon-card-wrapper">
            <div className="icon-card">
              <div className="card-front">
                <img
                  src={irIcon}
                  alt="IR Platform Feature"
                  className="vertical-icon"
                  id="ir-platform-icon"
                />
              </div>
              <div className="card-back">
                <p>
                  Effortlessly provides users with the exact product links of
                  any image uploaded.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UnfoldingSoonSection;
