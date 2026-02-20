import { NavLink } from "react-router-dom";

export function NavBar() {
  return (
    <nav className="navbar">
      <NavLink to="/" className={({ isActive }) => `navbar-link${isActive ? " active" : ""}`} end>
        Word Practice
      </NavLink>
      <NavLink
        to="/tones"
        className={({ isActive }) => `navbar-link${isActive ? " active" : ""}`}
      >
        Tone Practice
      </NavLink>
    </nav>
  );
}
