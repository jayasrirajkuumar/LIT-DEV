import React, { useEffect, useState } from "react";
import { Search, User } from "lucide-react";
import { searchLitUsers } from "../../services/walletApiService";
import "../../styles/gift-cards.css";

function maskPhone(phone) {
  if (!phone || phone.length < 4) return phone || "—";
  return `${phone.slice(0, phone.length - 2).replace(/\d(?=\d{2})/g, "X")}${phone.slice(-2)}`;
}

const LitUserSearch = ({ selectedUser, onSelect, onClear }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return undefined;
    }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await searchLitUsers(query);
        setResults(data.users ?? []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [query]);

  if (selectedUser) {
    return (
      <div className="gc-recipient-locked gc-card">
        <div className="gc-recipient-locked__avatar">
          {selectedUser.profilePicture ? (
            <img src={selectedUser.profilePicture} alt="" />
          ) : (
            <User size={24} />
          )}
        </div>
        <div className="gc-recipient-locked__info">
          <strong>{selectedUser.displayName}</strong>
          {selectedUser.username && <span>@{selectedUser.username}</span>}
          <span>{maskPhone(selectedUser.phoneNumber)}</span>
        </div>
        <button type="button" className="lit-btn lit-btn--outline" onClick={onClear}>
          Change
        </button>
      </div>
    );
  }

  return (
    <div className="gc-user-search">
      <label>Search LIT User</label>
      <div className="gc-user-search__input">
        <Search size={16} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Phone, username, or full name"
        />
      </div>
      {loading && <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem" }}>Searching...</p>}
      {results.length > 0 && (
        <ul className="gc-user-search__results">
          {results.map((user) => (
            <li key={user.id}>
              <div>
                <strong>{user.displayName}</strong>
                <span>{maskPhone(user.phoneNumber)}</span>
              </div>
              <button type="button" className="lit-btn lit-btn--primary lit-btn--sm" onClick={() => onSelect(user)}>
                Select
              </button>
            </li>
          ))}
        </ul>
      )}
      {query.length >= 2 && !loading && results.length === 0 && (
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem" }}>
          No registered LIT users found. Gift cards can only be sent to LIT members.
        </p>
      )}
    </div>
  );
};

export default LitUserSearch;
