import React, { useState } from "react";
import { CheckCircle2, Sparkles, Award } from "lucide-react";
import { LIT_GAME_DATA } from "../../data/marketplace/luxuryData";
import PageContainer from "./PageContainer";
import "../../styles/marketplace-luxury.css";

const MarketplaceLitGame = () => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [score, setScore] = useState(() => {
    try {
      const saved = localStorage.getItem("lit_game_score");
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  const game = LIT_GAME_DATA[currentIdx];

  const handleSelect = (choice) => {
    if (selectedChoice !== null) return;
    setSelectedChoice(choice);
    if (choice === game.moreExpensive) {
      const newScore = score + 100;
      setScore(newScore);
      try {
        localStorage.setItem("lit_game_score", newScore.toString());
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleNext = () => {
    setSelectedChoice(null);
    setCurrentIdx((prev) => (prev + 1) % LIT_GAME_DATA.length);
  };

  return (
    <section className="lux-game-section w-full py-14 sm:py-18 lg:py-24 select-none" aria-label="The LIT Game">
      <PageContainer>
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-10 text-center space-y-8 sm:space-y-10">
        {/* Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#151310] border border-[#2b2823] text-[10px] tracking-[0.24em] uppercase text-[#d8b87a] font-bold">
            <Sparkles size={12} />
            <span>THE LIT GAME</span>
          </div>

          <h2 className="lux-serif text-3xl sm:text-4xl lg:text-5xl text-[#faf8f5] font-normal tracking-wide pt-2">
            Which One Looks More Expensive?
          </h2>

          <p className="text-xs sm:text-sm text-[#a09a8f] font-light">
            Two exceptional pieces. One question. You decide.
          </p>

          {score > 0 && (
            <div className="inline-flex items-center gap-1.5 text-xs text-[#d8b87a] pt-1">
              <Award size={14} />
              <span>Score: {score} LIT Points</span>
            </div>
          )}
        </div>

        {/* 2 Choice Cards with VS in middle */}
        <div className="relative flex flex-col md:flex-row gap-0 w-full max-w-3xl mx-auto items-stretch justify-center">
          {/* Choice A */}
          <div
            onClick={() => handleSelect("A")}
            className={`lux-game-card flex-1 p-6 flex flex-col items-center justify-between cursor-pointer ${
              selectedChoice === "A" ? "is-selected" : ""
            }`}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && handleSelect("A")}
            aria-label={`Choose ${game.itemA.brand}`}
          >
            <div className="w-full aspect-square bg-[#ece7df] flex items-center justify-center p-6 mb-4">
              <img
                src={game.itemA.image}
                alt={game.itemA.name}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="text-center w-full space-y-1">
              <p className="text-xs font-bold tracking-[0.16em] uppercase text-[#faf8f5]">
                {game.itemA.brand}
              </p>
              <p className="text-xs text-[#a09a8f]">{game.itemA.name}</p>
              {selectedChoice !== null && (
                <p className="text-sm font-bold text-[#d8b87a] pt-2">
                  ₹{game.itemA.price.toLocaleString("en-IN")}
                </p>
              )}
            </div>
          </div>

          {/* Floating VS Badge — centered between cards */}
          <div className="relative md:w-0 flex items-center justify-center">
            <div className="lux-vs-circle absolute z-20 md:left-1/2 md:-translate-x-1/2">
              VS
            </div>
          </div>

          {/* Choice B */}
          <div
            onClick={() => handleSelect("B")}
            className={`lux-game-card flex-1 p-6 flex flex-col items-center justify-between cursor-pointer ${
              selectedChoice === "B" ? "is-selected" : ""
            }`}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && handleSelect("B")}
            aria-label={`Choose ${game.itemB.brand}`}
          >
            <div className="w-full aspect-square bg-[#ece7df] flex items-center justify-center p-6 mb-4">
              <img
                src={game.itemB.image}
                alt={game.itemB.name}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="text-center w-full space-y-1">
              <p className="text-xs font-bold tracking-[0.16em] uppercase text-[#faf8f5]">
                {game.itemB.brand}
              </p>
              <p className="text-xs text-[#a09a8f]">{game.itemB.name}</p>
              {selectedChoice !== null && (
                <p className="text-sm font-bold text-[#d8b87a] pt-2">
                  ₹{game.itemB.price.toLocaleString("en-IN")}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Revealed Outcome & Explanation */}
        {selectedChoice !== null && (
          <div className="max-w-2xl mx-auto p-6 bg-[#0c0b09] border border-[#262420] text-center space-y-3 animate-fade-in">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#d8b87a]">
              <CheckCircle2 size={16} />
              <span>
                {selectedChoice === game.moreExpensive
                  ? "Brilliant! You identified the more exclusive piece."
                  : "Both look exquisite — but one retails higher."}
              </span>
            </div>
            <p className="text-xs text-[#a09a8f] leading-relaxed">
              {game.explanation}
            </p>
            <button
              type="button"
              onClick={handleNext}
              className="lux-btn-primary text-xs py-2 px-6 tracking-[0.16em] mt-2"
            >
              PLAY NEXT ROUND
            </button>
          </div>
        )}
      </div>
      </PageContainer>
    </section>
  );
};

export default MarketplaceLitGame;
