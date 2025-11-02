import { NavLink, useLocation, useNavigate } from "react-router";
import { useState, useEffect, useRef } from "react";
import PointCounter from "./PointCounter";
import ProfilBillede from "./ProfilBillede";
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
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showDropdown &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown]);

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
        <div className="parent-menu" ref={dropdownRef}>
          <ProfilBillede
            size={32}
            className="parent-icon"
            onClick={toggleDropdown}
          />
          {showDropdown && (
            <div className="dropdown-menu">
              <NavLink to="/profil" className="dropdown-item">
                <p> Profil 👤</p>
              </NavLink>
              <NavLink to="/indstillinger" className="dropdown-item">
                <p> Indstillinger ⚙️</p>
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
        <div className="parent-menu" ref={dropdownRef}>
          <ProfilBillede
            size={32}
            className="parent-icon"
            onClick={toggleDropdown}
          />
          {showDropdown && (
            <div className="dropdown-menu">
              <NavLink to="/profil" className="dropdown-item">
                <p> Profil 👤</p>
              </NavLink>
              <NavLink to="/indstillinger" className="dropdown-item">
                <p> Indstillinger ⚙️</p>
              </NavLink>
              <NavLink to="/login" className="dropdown-item">
                <p className="log-ud"> Log ud ➜] </p>
              </NavLink>
            </div>
          )}
        </div>
      </nav>
    );
  }
}
