import React from "react";
import { Trophy, Medal, Users, BarChart3 } from "lucide-react";

const COMING_SOON_ITEMS = [
  { icon: Medal, label: "Achievements" },
  { icon: Trophy, label: "Badges" },
  { icon: Users, label: "Community Features" },
  { icon: BarChart3, label: "Leaderboard" },
];

const ComingSoonSection = () => (
  <section className="profile-coming-soon-card">
    <div className="profile-section-title">Coming Soon</div>
    <div className="profile-coming-soon-grid">
      {COMING_SOON_ITEMS.map(({ icon: Icon, label }) => (
        <div className="profile-coming-soon-item" key={label}>
          <Icon size={22} />
          <span>{label}</span>
        </div>
      ))}
    </div>
    <p className="profile-coming-soon-message">
      This feature is currently under development and will be available in a future
      release.
    </p>
  </section>
);

export default ComingSoonSection;
