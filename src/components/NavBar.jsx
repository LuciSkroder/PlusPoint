import { NavLink, useLocation, useNavigate } from "react-router";
import { useState, useEffect, useRef } from "react";
import PointCounter from "./PointCounter";
import ProfilBillede from "./ProfilBillede";
import { Auth, DataBase } from "./DataBase";
import { ref, get } from "firebase/database";
import "../css/navbar.css";

function GåTilbage() {
  const navigate = useNavigate();
  return (
    <button className="tilbage-knap" onClick={() => navigate("/", { replace: true })}>
      ➜
    </button>
  );
}

export default function NavBar() {
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [rolle, setRolle] = useState(null);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  useEffect(() => {
  if (window.location.pathname.endsWith("/PlusPoint")) {
    window.history.replaceState({}, "", "/PlusPoint/");
  }
}, []);

  useEffect(() => {
    const checkUserRole = Auth.onAuthStateChanged(async (user) => {
      if (user) {
        const childProfileRef = ref(
          DataBase,
          `childrenProfiles/${user.uid}/parentUid`
        );
        const snapshot = await get(childProfileRef);
        if (snapshot.exists()) {
          setRolle("child");
        } else {
          setRolle("parent");
        }
      }
    });
    return () => checkUserRole();
  }, []);

  function handleLogout(e) {
    e.preventDefault();
    const confirmed = window.confirm("Er du sikker på, at du vil logge ud?");
    if (confirmed) {
      window.location.href = "/PlusPoint/login";
    }
  }

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

  if (
    location.pathname === "/login" ||
    location.pathname === "/signup" ||
    location.pathname === "/forgotpassword"
  ) {
    return null;
  } else if (location.pathname === "/") {
    return (
      <nav className="top-nav">
        <NavLink to="/login" className="dropdown-item" onClick={handleLogout}>
          <img
            src="./img/logout.png"
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
              <NavLink
                to="/profil"
                className="dropdown-item"
                onClick={() => setShowDropdown(false)}
              >
                <p> Profil 👤</p>
              </NavLink>
              {rolle === "parent" && (
                <NavLink
                  to="/create"
                  className="dropdown-item"
                  onClick={() => setShowDropdown(false)}
                >
                  <p> Opret Opgave ➕</p>
                </NavLink>
              )}
              <NavLink
                to="/indstillinger"
                className="dropdown-item"
                onClick={() => setShowDropdown(false)}
              >
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
              <NavLink
                to="/profil"
                className="dropdown-item"
                onClick={() => setShowDropdown(false)}
              >
                <p> Profil 👤</p>
              </NavLink>
              {rolle === "parent" && (
                <NavLink
                  to="/create"
                  className="dropdown-item"
                  onClick={() => setShowDropdown(false)}
                >
                  <p> Opret Opgave ➕</p>
                </NavLink>
              )}
              <NavLink
                to="/indstillinger"
                className="dropdown-item"
                onClick={() => setShowDropdown(false)}
              >
                <p> Indstillinger ⚙️</p>
              </NavLink>
              <NavLink
                to="/login"
                className="dropdown-item"
                onClick={(e) => {
                  setShowDropdown(false);
                  handleLogout(e);
                }}
              >
                <p className="log-ud"> Log ud ➜] </p>
              </NavLink>
            </div>
          )}
        </div>
      </nav>
    );
  }
}
