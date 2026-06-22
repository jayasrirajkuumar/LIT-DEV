import React, { useState } from "react";
import { api } from "../utils/api";

const ConnectionTest = () => {
  const [testEmail, setTestEmail] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    try {
      const response = await api.subscribe(testEmail);
      setResult({
        success: response.success,
        message: response.success
          ? "Connection successful! Backend is working."
          : `Connection failed: ${response.error || "Unknown error"}`,
      });
    } catch (error) {
      setResult({
        success: false,
        message: `Connection error: ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h2>Backend Connection Test</h2>
      <p>
        This component tests the connection between your frontend and Azure
        Functions backend.
      </p>

      <div style={{ marginBottom: "20px" }}>
        <input
          type="email"
          value={testEmail}
          onChange={(e) => setTestEmail(e.target.value)}
          placeholder="Enter test email"
          style={{ padding: "8px", width: "100%", marginBottom: "10px" }}
        />
        <button
          onClick={testConnection}
          disabled={loading || !testEmail}
          style={{
            padding: "8px 16px",
            backgroundColor: "#0078d4",
            color: "white",
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Testing..." : "Test Connection"}
        </button>
      </div>

      {result && (
        <div
          style={{
            padding: "15px",
            backgroundColor: result.success ? "#dff0d8" : "#f2dede",
            border: `1px solid ${result.success ? "#d6e9c6" : "#ebccd1"}`,
            borderRadius: "4px",
          }}
        >
          <p
            style={{ margin: 0, color: result.success ? "#3c763d" : "#a94442" }}
          >
            {result.message}
          </p>
        </div>
      )}
    </div>
  );
};

export default ConnectionTest;
