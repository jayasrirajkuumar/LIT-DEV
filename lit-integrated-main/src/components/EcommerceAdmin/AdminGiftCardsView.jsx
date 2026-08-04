import React, { useEffect, useState } from "react";
import { AdminPageHeader, AdminKpiCard, AdminInput, AdminStatusBadge } from "../admin-ui";
import { fetchAdminGiftCards, fetchAdminGiftCardAnalytics } from "../../services/giftCardApiService";

const AdminGiftCardsView = () => {
  const [analytics, setAnalytics] = useState(null);
  const [giftCards, setGiftCards] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [stats, list] = await Promise.all([
        fetchAdminGiftCardAnalytics(),
        fetchAdminGiftCards({ search: search || undefined }),
      ]);
      setAnalytics(stats.analytics ?? stats);
      setGiftCards(list.giftCards ?? []);
    } catch {
      setAnalytics(null);
      setGiftCards([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    load();
  };

  return (
    <div className="adm-page">
      <AdminPageHeader title="Gift Cards" subtitle="Manage digital gift cards, analytics, and delivery." />

      {analytics && (
        <div className="adm-kpi-grid" style={{ marginBottom: "1.5rem" }}>
          <AdminKpiCard label="Total Sold" value={analytics.totalGiftCards} />
          <AdminKpiCard label="Revenue" value={`₹${Number(analytics.revenue || 0).toLocaleString()}`} />
          <AdminKpiCard label="Redeemed" value={analytics.redeemed} />
          <AdminKpiCard label="Pending" value={analytics.pending} />
          <AdminKpiCard label="Scheduled" value={analytics.scheduled} />
          <AdminKpiCard label="Redemption %" value={`${analytics.redemptionRate}%`} />
        </div>
      )}

      <form onSubmit={handleSearch} style={{ display: "flex", gap: 8, marginBottom: "1rem" }}>
        <AdminInput placeholder="Search code, email, name..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <button type="submit" className="adm-btn adm-btn--primary">Search</button>
      </form>

      <div className="adm-card">
        {loading && <p>Loading...</p>}
        {!loading && giftCards.length === 0 && <p>No gift cards yet.</p>}
        <table className="adm-table" style={{ width: "100%" }}>
          <thead>
            <tr>
              <th>Code</th>
              <th>Recipient</th>
              <th>Sender</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {giftCards.map((card) => (
              <tr key={card.id}>
                <td><code>{card.giftCardCode}</code></td>
                <td>{card.recipientName}<br /><small>{card.recipientEmail}</small></td>
                <td>{card.senderName}</td>
                <td>₹{card.amount?.toLocaleString()}</td>
                <td><AdminStatusBadge status={card.status} /></td>
                <td>{new Date(card.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminGiftCardsView;
