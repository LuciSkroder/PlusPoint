import { NavLink, useLocation } from "react-router";
import "../css/bottomnav.css";

export default function BottomNav() {
  const location = useLocation();

  if (
    location.pathname === "/login" ||
    location.pathname === "/signup" ||
    location.pathname === "/forgotpassword"
  ) {
    return null;
  } else {
    return (
      <nav className="bottom-nav">
        <NavLink to="/shop">
          <img src="./img/shopping-cart.svg" alt="Shopping Cart" />
        </NavLink>
        <NavLink to="/">
          <img src="./img/home.svg" alt="Home" />
        </NavLink>
        <NavLink to="/taskpage">
          <img src="./img/to-do.svg" alt="To Do" />
        </NavLink>
      </nav>
    );
  }
}
