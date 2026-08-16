import React, { useEffect, useState } from "react";
import { Search, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { searchLitUsers } from "../../services/walletApiService";
import "../../styles/gift-cards.css";

function maskPhone(phone) {
  if (!phone || phone.length < 4) return phone || "—";
  return `${phone.slice(0, phone.length - 2).replace(/\d(?=\d{2})/g, "X")}${phone.slice(-2)}`;
}

const LitUserSearch = ({ selectedUser, onSelect, onClear, isAuthenticated = false }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hint, setHint] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      setResults([]);
      setError("");
      setHint("");
      return undefined;
    }

    if (!query || query.length < 2) {
      setResults([]);
      setError("");
      setHint("");
      return undefined;
    }

    const t = setTimeout(async () => {
      setLoading(true);
      setError("");
      setHint("");
      try {
        const data = await searchLitUsers(query);
        setResults(data.users ?? []);
        setHint(data.hint ?? "");
      } catch (err) {
        setResults([]);
        setHint("");
        const message = err?.message || "Unable to search users right now.";
        if (message.toLowerCase().includes("authentication") || message.toLowerCase().includes("token")) {
          setError("Sign in again to search for registered LIT members.");
        } else if (message.toLowerCase().includes("database")) {
          setError("User search is unavailable while the database is offline. Restart the backend and try again.");
        } else if (message.toLowerCase().includes("sync")) {
          setError("Your account is not synced yet. Sign out, sign in again, then retry.");
        } else {
          setError(message);
        }
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(t);
  }, [query, isAuthenticated]);

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

  if (!isAuthenticated) {
    return (
      <div className="gc-user-search">
        <label>Search LIT User</label>
        <p className="gc-user-search__status">
          Sign in to search for registered LIT members by name, email, or phone number.
        </p>
        <button
          type="button"
          className="lit-btn lit-btn--outline"
          style={{ marginTop: "0.75rem" }}
          onClick={() => navigate("/signin", { state: { from: "/gift-cards" } })}
        >
          Sign in to search users
        </button>
      </div>
    );
  }

  return (
    <div className="gc-user-search">
      <label htmlFor="gc-user-search-input">Search LIT User</label>
      <p className="gc-user-search__status" style={{ marginBottom: "0.5rem" }}>
        Search by another member&apos;s name, email, or phone. You cannot send a gift card to yourself.
      </p>
      <div className="gc-user-search__input">
        <Search size={16} aria-hidden="true" />
        <input
          id="gc-user-search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. Anjum, Deena, or phone number"
          autoComplete="off"
        />
      </div>
      {loading && <p className="gc-user-search__status">Searching...</p>}
      {error && <p className="gc-field__error">{error}</p>}
      {results.length > 0 && (
        <ul className="gc-user-search__results">
          {results.map((user) => (
            <li key={user.id}>
              <div>
                <strong>{user.displayName}</strong>
                {user.username && <span>@{user.username}</span>}
                <span>{maskPhone(user.phoneNumber)}</span>
              </div>
              <button type="button" className="lit-btn lit-btn--primary lit-btn--sm" onClick={() => onSelect(user)}>
                Select
              </button>
            </li>
          ))}
        </ul>
      )}
      {query.length >= 2 && !loading && !error && results.length === 0 && (
        <p className="gc-user-search__status">{hint || "No registered LIT users found. Try another name, email, or phone number."}</p>
      )}
    </div>
  );
};

export default LitUserSearch;
