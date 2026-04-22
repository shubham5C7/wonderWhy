import { useDispatch, useSelector } from "react-redux";
import { PiSun, PiMoon } from "react-icons/pi";
import { Link } from "react-router-dom";
import { toggleTheme } from "../features/themeSlice";

const NavBar = () => {
  const isDark = useSelector((state) => state.theme.isDark);
  const dispatch = useDispatch();

  return (
    <nav
      className={`fixed top-0 left-0 w-full h-14 px-6 flex items-center justify-between z-50 shadow-sm
        ${isDark
          ? "bg-gray-600 text-white ring-1 ring-white/10"
          : "bg-white text-gray-900 ring-1 ring-gray-200"
        }
      `}
    >

      {/* LEFT - LOGO */}
      <Link to="/" className="flex items-center">
        <img
           src="https://www.image2url.com/r2/default/images/1776781517336-87556768-2b48-4cc0-9a85-ee347f13c689.png"
          alt="uploaded image"
          className="h-40 object-contain"
        />
      </Link>

      {/* RIGHT - THEME TOGGLE */}
      <button
        onClick={() => dispatch(toggleTheme())}
        className={`p-2 rounded-full transition
          ${isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"}
        `}
        aria-label="Toggle Theme"
      >
        {isDark ? <PiSun size={24} /> : <PiMoon size={24} />}
      </button>

    </nav>
  );
};

export default NavBar;