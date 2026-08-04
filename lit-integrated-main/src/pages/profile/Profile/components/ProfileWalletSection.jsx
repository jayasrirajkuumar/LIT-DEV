import React from "react";
import { Link } from "react-router-dom";
import { Wallet } from "lucide-react";

const ProfileWalletSection = () => (
  <section className="profile-wallet-card">
    <div className="profile-section-title">
      <Wallet size={20} /> Wallet
    </div>
    <p style={{ color: "rgba(255,255,255,0.65)", marginBottom: "1rem" }}>
      View balance, transactions, and gift card history.
    </p>
    <Link to="/profile/wallet" className="lit-btn lit-btn--primary">
      Open Wallet
    </Link>
  </section>
);

export default ProfileWalletSection;
