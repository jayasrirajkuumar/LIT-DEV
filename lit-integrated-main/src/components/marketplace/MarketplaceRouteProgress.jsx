import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const MarketplaceRouteProgress = () => {
  const location = useLocation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = window.setTimeout(() => setVisible(false), 450);
    return () => window.clearTimeout(timer);
  }, [location.pathname, location.search]);

  return (
    <div className={`lux-route-progress ${visible ? "is-visible" : ""}`} aria-hidden={!visible}>
      <span />
      <p>Loading collection…</p>
    </div>
  );
};

export default MarketplaceRouteProgress;
