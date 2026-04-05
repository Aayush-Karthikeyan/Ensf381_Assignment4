import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const API = "http://localhost:5000";

function validateUsername(username) {
  if (username.length < 3 || username.length > 20)
    return "Username must be between 3 and 20 characters.";
  if (!/^[A-Za-z]/.test(username))
    return "Username must start with a letter.";
  if (!/^[A-Za-z0-9_\-]+$/.test(username))
    return "Username may only contain letters, numbers, underscores, and hyphens.";
  return null;
}

function validateEmail(email) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return "Email must be in a valid format.";
  return null;
}

function validatePassword(password) {
  if (password.length < 8)
    return "Password must be at least 8 characters long.";
  if (!/[A-Z]/.test(password))
    return "Password must contain at least one uppercase letter.";
  if (!/[a-z]/.test(password))
    return "Password must contain at least one lowercase letter.";
  if (!/\d/.test(password))
    return "Password must contain at least one number.";
  if (!/[^A-Za-z0-9]/.test(password))
    return "Password must contain at least one special character.";
  return null;
}

function SignupForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState(null);
  const navigate = useNavigate();

  const handleSignup = (e) => {
    e.preventDefault();

    // Frontend validation
    const usernameErr = validateUsername(username);
    if (usernameErr) { setStatus({ type: "error", message: usernameErr }); return; }

    const emailErr = validateEmail(email);
    if (emailErr) { setStatus({ type: "error", message: emailErr }); return; }

    const passwordErr = validatePassword(password);
    if (passwordErr) { setStatus({ type: "error", message: passwordErr }); return; }

    if (password !== confirmPassword) {
      setStatus({ type: "error", message: "Passwords do not match." });
      return;
    }

    fetch(`${API}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStatus({ type: "success", message: data.message });
          setTimeout(() => navigate("/login"), 1000);
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
      <form onSubmit={handleSignup}>
        <h2 className="login-title">Sign Up</h2>

        <label>Username</label>
        <input
          className="login-input"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <br />
        <label>Email</label>
        <input
          className="login-input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
        <label>Confirm Password</label>
        <input
          className="login-input"
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <br />
        <button className="login-button" type="submit">
          Signup
        </button>

        {status && (
          <p className={status.type === "success" ? "status-success" : "status-error"}>
            {status.message}
          </p>
        )}

        <p style={{ fontSize: "14px" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ background: "none", color: "#8b4a2b", padding: 0, margin: 0, fontSize: "14px" }}>
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}

export default SignupForm;
