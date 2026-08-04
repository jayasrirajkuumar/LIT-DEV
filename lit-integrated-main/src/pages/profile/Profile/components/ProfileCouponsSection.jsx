import React, { useEffect, useState } from "react";
import { fetchUserCoupons } from "../../../../services/marketplaceApiService";
import { formatCatalogPrice } from "../../../../utils/catalogFormat";

const ProfileCouponsSection = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUserCoupons()
      .then(setCoupons)
      .catch((err) => setError(err.message || "Failed to load coupons."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="order-details-container profile-coupons">
      <div className="profile-card-header">
        <h2 className="profile-section-title">My Coupons</h2>
      </div>
      <p className="profile-section-subtitle">Welcome offers and promotions applied to your account.</p>

      {loading && <p className="profile-empty-state">Loading coupons...</p>}
      {error && <p className="profile-empty-state">{error}</p>}

      {!loading && !error && coupons.length === 0 && (
        <div className="profile-empty-state">
          <p>No active coupons yet.</p>
        </div>
      )}

      {!loading && !error && coupons.length > 0 && (
        <ul className="profile-coupons__list">
          {coupons.map((coupon) => (
            <li key={coupon.id} className={`profile-coupon ${coupon.isUsed ? "is-used" : ""}`}>
              <div>
                <p className="profile-coupon__code">{coupon.code}</p>
                <p className="profile-coupon__amount">
                  {formatCatalogPrice(coupon.amount, "INR")} off
                </p>
              </div>
              <div className="profile-coupon__meta">
                <span>{coupon.source}</span>
                {coupon.expiresAt && (
                  <span>Expires {new Date(coupon.expiresAt).toLocaleDateString()}</span>
                )}
                {coupon.isUsed && <span>Used</span>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ProfileCouponsSection;
