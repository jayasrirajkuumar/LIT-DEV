import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./GameModesPage.css";
import bodyBg from "../assets/body-bg.png"; // Import the background image

const GameModes = () => {
  const [activeTab, setActiveTab] = useState("clothing");
  const [notifications] = useState([
    {
      id: 1,
      type: "friend",
      message: "New Friend Request – Game master42 wants to be friends",
      buttons: ["Accept", "Decline"],
    },
    {
      id: 2,
      type: "game",
      message: "Game Invite – Team battle in Tournament mode",
      buttons: ["Join", "Skip"],
    },
  ]);

  const gameModes = [
    {
      id: 1,
      title: "Single Mode",
      description: "Normal game mode with two options",
      image: "/images/game-modes/single-mode.png",
    },
    {
      id: 2,
      title: "Tournament Mode",
      description: "8 players facing off in elimination",
      image: "/images/game-modes/tournament-mode.png",
    },
    {
      id: 3,
      title: "Team Battle",
      description: "Team up with your friends",
      image: "/images/game-modes/team-battle.png",
    },
    {
      id: 4,
      title: "Fashion Showdown",
      description: "Among 6, one wins based on fashion",
      image: "/images/game-modes/fashion-showdown.png",
    },
  ];

  const leaderboard = [
    { rank: 1, username: "LuxuryinTaste", coins: 555 },
    { rank: 2, username: "Gamer42", coins: 534 },
    { rank: 3, username: "Alix Johnson", coins: 510 },
    { rank: 4, username: "Mariya Satnova", coins: 500 },
    { rank: 5, username: "Liya James", coins: 485 },
  ];

  return (
    <div
      className="game-modes-page"
      style={{
        backgroundImage: `url(${bodyBg})`,
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Assuming Navbar is handled separately as per your request */}
      <div className="game-modes-container">
        {/* Left Sidebar */}
        <div className="sidebar">
          <div className="quick-menu">
            <h3>Quick Menu</h3>
            <ul>
              <li className="active">Game Mode</li>
              <li>Tournaments</li>
              <li>Shop</li>
              <li>Friends</li>
            </ul>
          </div>

          <div className="notifications">
            <h3>Recent Notifications</h3>
            {notifications.map((notification) => (
              <div key={notification.id} className="notification-card">
                <p>{notification.message}</p>
                <div className="notification-buttons">
                  {notification.buttons.map((button) => (
                    <button key={button} className="notification-btn">
                      {button}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="main-content">
          {/* Tabs */}
          <div className="content-header">
            <div className="tabs">
              <button
                className={activeTab === "clothing" ? "active" : ""}
                onClick={() => setActiveTab("clothing")}
              >
                Clothing
              </button>
              <button
                className={activeTab === "bags" ? "active" : ""}
                onClick={() => setActiveTab("bags")}
              >
                Bags
              </button>
              <button
                className={activeTab === "accessories" ? "active" : ""}
                onClick={() => setActiveTab("accessories")}
              >
                Accessories
              </button>
              <button
                className={activeTab === "footwear" ? "active" : ""}
                onClick={() => setActiveTab("footwear")}
              >
                Footwear
              </button>
            </div>
          </div>

          {/* Game Mode Cards */}
          <div className="game-modes-list">
            {gameModes.map((mode) => (
              <div
                key={mode.id}
                className="game-mode-card"
                style={{ backgroundImage: `url(${mode.image})` }}
              >
                <div className="game-mode-gradient"></div>
                <div className="game-mode-info">
                  <h3 className="game-mode-title">{mode.title}</h3>
                  <p className="game-mode-description">{mode.description}</p>
                  <button className="play-now-btn">Play Now</button>
                </div>
              </div>
            ))}
          </div>

          {/* Leaderboard */}
          <div className="leaderboard-section">
            <div className="leaderboard-header">
              <h3>Leaderboard</h3>
              <button className="view-all-btn">View All</button>
            </div>
            <div className="leaderboard-card">
              {leaderboard.map((player) => (
                <div key={player.rank} className="leaderboard-item">
                  <span className="rank">#{player.rank}</span>
                  <div className="player-info">
                    <span className="username">{player.username}</span>
                    <span className="coins">
                      <img src="/coin-icon.png" alt="coins" />
                      {player.coins}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Assuming Footer is handled separately */}
    </div>
  );
};

export default GameModes;
