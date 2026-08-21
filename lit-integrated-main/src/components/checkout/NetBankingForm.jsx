// src/components/checkout/NetBankingForm.jsx
import React, { useState, useRef, useEffect } from "react";
import { Landmark, ChevronDown } from "lucide-react";

// Step 1: Import the logos from your assets folder
import hdfcLogo from "../../assets/bank-logos/HDB.png";
import iciciLogo from "../../assets/bank-logos/IBN.png";
import sbiLogo from "../../assets/bank-logos/state-bank-of-india-logo-circle-15ad.png";
import axisLogo from "../../assets/bank-logos/AXISBANK.BO.png";
import centralLogo from "../../assets/bank-logos/CENTRALBK.NS.png";
import iobLogo from "../../assets/bank-logos/IOB.NS.png";
import cubLogo from "../../assets/bank-logos/CUB.NS.png";
import indianbLogo from "../../assets/bank-logos/INDIANB.NS.png";

// Step 2: Banks list with logos
const banks = [
  { name: "HDFC Bank", logo: hdfcLogo },
  { name: "ICICI Bank", logo: iciciLogo },
  { name: "State Bank of India", logo: sbiLogo },
  { name: "Axis Bank", logo: axisLogo },
  { name: "Central Bank of India", logo: centralLogo },
  { name: "Indian Overseas Bank", logo: iobLogo },
  { name: "City Union Bank", logo: cubLogo },
  { name: "Indian Bank", logo: indianbLogo },
];

const NetBankingForm = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState(null);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectBank = (bank) => {
    setSelectedBank(bank);
    setIsOpen(false);
  };

  return (
    <div className="w-full flex flex-col gap-4 text-[#faf8f5]">
      {/* Form Header */}
      <div className="flex items-center gap-3 pb-3 border-b border-white/10">
        <Landmark className="text-[#c5a059]" size={22} />
        <h4 className="text-base font-semibold text-[#faf8f5] tracking-wide">
          Net Banking
        </h4>
      </div>

      {/* Dropdown Selector */}
      <div className="flex flex-col gap-2" ref={dropdownRef}>
        <label className="text-xs font-medium text-[#bcb6ac] tracking-wide">
          Select Bank from the List
        </label>

        <div className="relative mt-1">
          {/* Dropdown Trigger Header */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between bg-black/40 hover:bg-black/60 border border-white/15 focus:border-[#c5a059] rounded-xl px-4 py-3 text-sm text-[#faf8f5] transition-all duration-200 outline-none cursor-pointer"
          >
            {selectedBank ? (
              <div className="flex items-center gap-3">
                <img
                  src={selectedBank.logo}
                  alt={selectedBank.name}
                  className="w-6 h-6 object-contain rounded"
                />
                <span className="font-medium text-[#faf8f5]">
                  {selectedBank.name}
                </span>
              </div>
            ) : (
              <span className="text-[#8c8579]">Select Bank</span>
            )}
            <ChevronDown
              size={18}
              className={`text-[#bcb6ac] transition-transform duration-300 ${
                isOpen ? "rotate-180 text-[#c5a059]" : ""
              }`}
            />
          </button>

          {/* Dropdown List Menu */}
          {isOpen && (
            <ul className="absolute top-[calc(100%+6px)] left-0 right-0 z-50 bg-[#0d0c0a]/95 backdrop-blur-xl border border-white/15 rounded-xl p-2 max-h-64 overflow-y-auto shadow-2xl space-y-1">
              {banks.map((bank) => {
                const isSelected = selectedBank?.name === bank.name;
                return (
                  <li
                    key={bank.name}
                    onClick={() => handleSelectBank(bank)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-white/15 text-[#faf8f5]"
                        : "text-[#d6d0c7] hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {/* Radio Indicator */}
                    <span
                      className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                        isSelected
                          ? "border-[#c5a059] bg-[#c5a059]"
                          : "border-white/30 bg-transparent"
                      }`}
                    >
                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-black" />
                      )}
                    </span>

                    <img
                      src={bank.logo}
                      alt={bank.name}
                      className="w-7 h-7 object-contain bg-white/5 p-0.5 rounded"
                    />
                    <span className="text-sm font-medium">{bank.name}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Action Button */}
      <button
        type="button"
        disabled={!selectedBank}
        className={`w-full py-3.5 px-6 rounded-xl text-xs font-bold tracking-[0.16em] uppercase transition-all duration-200 mt-2 ${
          selectedBank
            ? "bg-[#c5a059] hover:bg-[#d8b87a] text-black shadow-lg cursor-pointer"
            : "bg-white/10 text-white/40 cursor-not-allowed border border-white/5"
        }`}
      >
        {selectedBank ? "Proceed" : "Pay Now"}
      </button>
    </div>
  );
};

export default NetBankingForm;
