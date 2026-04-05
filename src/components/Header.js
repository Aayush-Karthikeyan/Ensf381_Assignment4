import React from "react";
import { Link, useNavigate } from "react-router-dom";

function Header() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("userId");

  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    navigate("/");
  };

  return (
    <>
      <header>
        <img src="/images/logo.webp" alt="Sweet Scoop" />
        <h1>Sweet Scoop Ice Cream Shop</h1>
        <div className="header-auth">
          {isLoggedIn ? (
            <button className="auth-button" onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <Link to="/login" className="auth-button">
              Login
            </Link>
          )}
        </div>
      </header>

      <div className="navbar">
        <Link to="/">Home</Link>
        <Link to="/flavors">Flavors</Link>
        <Link to="/order-history">Order History</Link>
      </div>
    </>
  );
}

export default Header;
