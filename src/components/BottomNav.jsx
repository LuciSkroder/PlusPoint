import { NavLink } from "react-router";
import "../css/bottomnav.css";

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      <NavLink to="/">Home</NavLink>
      <NavLink to="/create">Create</NavLink>
    </nav>
  );
}