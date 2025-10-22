import { NavLink } from "react-router";
import PointCounter from "./PointCounter";
import "../css/navbar.css";

export default function NavBar() {
  return (
    <nav className="top-nav">
      <NavLink to="/">Home</NavLink>
      <PointCounter></PointCounter>
      <NavLink to="/create">Create</NavLink>
    </nav>
  );
}
