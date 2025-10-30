import { NavLink, useLocation } from "react-router";
import "../css/bottomnav.css";

export default function BottomNav() {
  const location = useLocation();

  if (location.pathname === "/login") {
    return null;
  } else {
    return (
      <nav className="bottom-nav">
        <NavLink to="/shop">
          <img src="./public/img/shopping-cart.svg" alt="Shopping Cart" />
        </NavLink>
        <NavLink to="/">
          <img src="./public/img/home.svg" alt="Home" />
        </NavLink>
        <NavLink to="/tasks">
          <img src="./public/img/to-do.svg" alt="To Do" />
        </NavLink>
      </nav>
    );
  }
}
