import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const API = "http://localhost:5000";

function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState(null);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    if (!username || !password) {
      setStatus({ type: "error", message: "Fields cannot be empty." });
      return;
    }

    fetch(`${API}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          localStorage.setItem("userId", data.userId);
          localStorage.setItem("username", data.username);
          setStatus({ type: "success", message: data.message });
          setTimeout(() => navigate("/flavors"), 1000);
        } else {
          setStatus({ type: "error", message: data.message });
        }
      })
      .catch(() => {
        setStatus({ type: "error", message: "Could not connect to server." });
      });
  };

  return (
    <div className="login-form">
      <form onSubmit={handleLogin}>
        <h2 className="login-title">Login</h2>

        <label>Username</label>
        <input
          className="login-input"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <br />
        <label>Password</label>
        <input
          className="login-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <br />
        <button className="login-button" type="submit">
          Login
        </button>

        {status && (
          <p className={status.type === "success" ? "status-success" : "status-error"}>
            {status.message}
          </p>
        )}

        <p className="forgot-password">Forgot Password?</p>
        <p style={{ fontSize: "14px" }}>
          Need an account?{" "}
          <Link to="/signup" style={{ background: "none", color: "#8b4a2b", padding: 0, margin: 0, fontSize: "14px" }}>
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}

export default LoginForm;