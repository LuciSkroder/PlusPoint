import { NavLink, useLocation, useNavigate } from "react-router";
import { useState } from "react";
import PointCounter from "./PointCounter";
import "../css/navbar.css";

function GåTilbage() {
  const navigate = useNavigate();
  return (
    <button className="tilbage-knap" onClick={() => navigate(-1)}>
      ➜
    </button>
  );
}

export default function NavBar() {
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  if (location.pathname === "/login") {
    return null;
  } else if (location.pathname === "/") {
    return (
      <nav className="top-nav">
        <NavLink to="/login" className="dropdown-item">
                <img
                  src="./public/img/logout.png"
                  alt="logout"
                  className="logout-icon"
                />
        </NavLink>
        <PointCounter></PointCounter>
        <div className="parent-menu">
          <img
            src="./public/img/icon-black.svg"
            className="parent-icon"
            onClick={toggleDropdown}
          />
          {showDropdown && (
            <div className="dropdown-menu">
              <NavLink to="/login" className="dropdown-item">
                <img
                  src="./public/img/logout.png"
                  alt="logout"
                  className="logout-icon"
                />
                Logout
              </NavLink>
            </div>
          )}
        </div>
      </nav>
    );
  } else {
    return (
      <nav className="top-nav">
        <GåTilbage></GåTilbage>
        <PointCounter></PointCounter>
        <div className="parent-menu">
          <img
            src="/img/icon-black.svg"
            className="parent-icon"
            onClick={toggleDropdown}
          />
          {showDropdown && (
            <div className="dropdown-menu">
              <NavLink to="/login" className="dropdown-item">
                <img
                  src="./public/img/logout.png"
                  alt="logout"
                  className="logout-icon"
                />
                Logout
              </NavLink>
              <div className="dropdown-item">
                <p>⚙️ Indstillinger</p>
              </div>
            </div>
          )}
        </div>
      </nav>
    );
  }
}
