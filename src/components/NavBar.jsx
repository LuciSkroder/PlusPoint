import { NavLink } from "react-router";
import PointCounter from "./PointCounter";
import "../css/navbar.css";

export default function NavBar() {
  return (
    <nav className="top-nav">
      <NavLink to="/login">
        <img src="../img/logout.png" alt="logout" className="logout-icon" />
      </NavLink>
      <PointCounter></PointCounter>
      <NavLink to="/create">Create</NavLink>
    </nav>
  );
}
