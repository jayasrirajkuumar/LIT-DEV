import React, { useEffect, useState } from "react";
import { fetchMarketplaceConfig } from "../../services/marketplaceApiService";
import "./MarketplaceAnnouncementBar.css";

const DEFAULT_MESSAGES = [
  "New Luxury Collection",
  "Free Shipping Above ₹2999",
  "Flat 10% OFF for New Users",
  "Secure Payments",
  "Easy Returns",
];

const MarketplaceAnnouncementBar = () => {
  const [messages, setMessages] = useState(DEFAULT_MESSAGES);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    fetchMarketplaceConfig()
      .then((data) => {
        const active = (data.announcements ?? []).map((item) => item.message).filter(Boolean);
        if (active.length) setMessages(active);
      })
      .catch(() => setMessages(DEFAULT_MESSAGES));
  }, []);

  useEffect(() => {
    if (messages.length <= 1) return undefined;
    const timer = setInterval(() => setIndex((prev) => (prev + 1) % messages.length), 4000);
    return () => clearInterval(timer);
  }, [messages.length]);

  return (
    <div className="mp-announcement-bar" aria-live="polite">
      <div className="mp-announcement-bar__track">
        <span key={messages[index]} className="mp-announcement-bar__message">
          {messages[index]}
        </span>
      </div>
    </div>
  );
};

export default MarketplaceAnnouncementBar;
