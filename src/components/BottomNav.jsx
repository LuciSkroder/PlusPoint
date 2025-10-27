import { NavLink } from "react-router";
import "../css/bottomnav.css";

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      <NavLink to="/add-child">
        <img src="./public/img/shopping-cart.svg" alt="Shopping Cart" />
      </NavLink>
      <NavLink to="/">
        <img src="./public/img/home.svg" alt="Home" />
      </NavLink>
      <NavLink to="/create">
        <img src="./public/img/to-do.svg" alt="To Do" />
      </NavLink>
    </nav>
  );
}
