import React, { useState } from "react";
import { FaUser, FaLock, FaSpinner } from "react-icons/fa";
import { IoLogIn } from "react-icons/io5";
import "./Login.css";

const Login = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Store token
      localStorage.setItem("token", data.token);

      // Call success callback
      onLoginSuccess(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <IoLogIn className="login-logo" />
          <h1 className="login-title">Welcome</h1>
          <p className="login-subtitle">Please sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <FaUser className="input-icon" aria-hidden="true" />
            <input
              type="text"
              placeholder="USERNAME"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="login-input"
              required
              aria-label="Username"
            />
          </div>

          <div className="input-group">
            <FaLock className="input-icon" aria-hidden="true" />
            <input
              type="password"
              placeholder="PASSWORD"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
              required
              aria-label="Password"
            />
          </div>

          {error && (
            <div className="error-message" role="alert" aria-live="polite">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
            aria-label={loading ? "Logging in..." : "Login"}
          >
            {loading ? (
              <>
                <FaSpinner className="spinner" />
                LOGGING IN...
              </>
            ) : (
              "LOGIN"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
