import { Link, useLocation } from "react-router-dom";
import "../styles/sidebar.css";

function Sidebar({ isOpen, onClose }) {

  const location = useLocation();

  const menuItems = [
    { name: "Home", path: "/home", icon: "🏠" },
    { name: "Explore", path: "/explore", icon: "🔍" },
    { name: "Post", path: "/post", icon: "➕" },
    { name: "Saved", path: "/saved", icon: "📌" }
  ];

  return (
    <>
      {/* Overlay backdrop for mobile */}
      <div
        className={`sidebar-overlay ${isOpen ? "show" : ""}`}
        onClick={onClose}
      />

      <aside className={`floating-sidebar ${isOpen ? "open" : ""}`}>

        <nav className="sidebar-nav">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className={`sidebar-item ${location.pathname === item.path ? "active" : ""
                }`}
              onClick={onClose}
            >
              <span className="icon">{item.icon}</span>
              <span className="label">{item.name}</span>
            </Link>
          ))}
        </nav>

      </aside>
    </>
  );
}

export default Sidebar;
