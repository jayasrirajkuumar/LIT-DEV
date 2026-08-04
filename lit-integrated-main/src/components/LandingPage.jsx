import React, { useState } from "react";
import JoinCommunity from "./JoinCommunity/JoinCommunity";
import Background from "./Background/Background";
import LitGame from "./LitGame/LitGame";
import Newsletter from "./Newsletter/Newsletter";
import Shop from "./Shop/Shop";
import UnfoldingSoonSection from "./UnfoldingSoonSection/UnfoldingSoonSection";
import Testimonials from "./Testimonials/Testimonials";
import RegisterInterest from "./RegisterInterest/RegisterInterest";
import NewsletterPopup from "./Newsletter/NewsletterPopup";
import { useUserAuth } from "../hooks/useUserAuth";
import "./LandingPage.css";

const LandingPage = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const { isAuthenticated } = useUserAuth();

  const openNewsletterPopup = () => {
    setIsPopupOpen(true);
  };

  const closeNewsletterPopup = () => {
    setIsPopupOpen(false);
  };

  return (
    <div className="landing-page">
      <NewsletterPopup isOpen={isPopupOpen} onClose={closeNewsletterPopup} />

      <JoinCommunity />
      <Background>
        <LitGame />
        <Newsletter onSubscribeClick={openNewsletterPopup} />
        <Shop />
        <UnfoldingSoonSection />
        <Testimonials />

        {/* 👇 Show "RegisterInterest" only if user is not logged in */}
        {!isAuthenticated && <RegisterInterest />}

        {/* Uncomment if you want to show footer */}
        {/* <Footer /> */}
      </Background>
    </div>
  );
};

export default LandingPage;
