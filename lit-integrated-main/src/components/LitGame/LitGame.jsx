import React from "react";
import "./LitGame.css";
import purpleShoe from "../../assets/purple-shoe.svg";
import blueShoe from "../../assets/blue-shoe.svg";
import { useNavigate } from "react-router-dom";

const LitGame = () => {
  const navigate = useNavigate();
  return (
    <section className="lit-game-container flex min-h-dvh w-full max-w-full items-center px-[clamp(1rem,10vw,12rem)] py-12 max-lg:py-16 max-sm:px-4" aria-labelledby="lit-game-title">
      <div className="game-section mx-auto flex min-h-[calc(100dvh-6rem)] w-full max-w-none items-center">
        <div className="lit-game-content">
          <div className="game-preview">
            <div className="lit-game-header">
              <span>LIT GAME</span>
            </div>
            <div className="game-cards">
              <div className="card left-card">
                <div className="image-container">
                  <img src={purpleShoe} alt="Purple Shoe" />
                </div>
                <span className="card-caption">???</span>
              </div>

              <div className="vs-text">VS</div>

              <div className="card right-card">
                <div className="image-container">
                  <img src={blueShoe} alt="Blue Shoe" />
                </div>
                <span className="card-caption">???</span>
              </div>
            </div>
          </div>

          <div className="game-info">
            <h2 id="lit-game-title">Engage in the Game</h2>
            <p>
              LIT Game tests your skills in spotting luxury from alternatives.
              Can you tell the difference? Challenge yourself and your friends
              today!
            </p>
            <button
              className="lit-game-play-now-btn"
              onClick={() => navigate("/game-modes")}
            >
              Play Now
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LitGame;
