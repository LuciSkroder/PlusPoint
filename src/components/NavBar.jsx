import { NavLink, useLocation, useNavigate } from "react-router";
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

  if (location.pathname === "/login") {
    return null;
  } else if (location.pathname === "/") {
    return (
      <nav className="top-nav">
        <NavLink to="/login">
          <img src="../img/logout.png" alt="logout" className="logout-icon" />
        </NavLink>
        <PointCounter></PointCounter>
        <NavLink to="/create">Create</NavLink>
      </nav>
    );
  } else {
    return (
      <nav className="top-nav">
        <GåTilbage></GåTilbage>
        <PointCounter></PointCounter>
        <NavLink to="/create">Create</NavLink>
      </nav>
    );
  }
}
