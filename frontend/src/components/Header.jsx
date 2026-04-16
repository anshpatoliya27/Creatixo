import "../styles/header.css";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import PostDetailsModal from "./PostDetailsModal";

function Header({ onToggleSidebar }) {
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch (err) {
    console.warn("Failed to parse user from localStorage", err);
    user = null;
  }

  const [openMenu, setOpenMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [selectedSearchPost, setSelectedSearchPost] = useState(null);

  const navigate = useNavigate();
  const menuRef = useRef();
  const searchRef = useRef();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Professional Auto-Suggest Search Logic
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(`http://localhost:5000/api/posts?search=${encodeURIComponent(searchQuery)}`);
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data);
          setShowSearchDropdown(true);
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsSearching(false);
      }
    }, 400); // Billion-dollar platform standard debounce

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  return (
    <>
    <header className="floating-navbar">

      <div className="nav-left">
        <button
          className="hamburger-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle menu"
        >
          ☰
        </button>
        <Link to="/home" style={{ textDecoration: 'none' }}>
          <div className="nav-logo">🧩 Creatixo</div>
        </Link>
      </div>

      <div className="nav-center" ref={searchRef}>
        <input
          type="text"
          placeholder="Search campaigns..."
          className="nav-search"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowSearchDropdown(true);
          }}
          onFocus={() => {
            if (searchQuery.trim()) setShowSearchDropdown(true);
          }}
        />
        
        {/* Floating Search Dropdown */}
        {showSearchDropdown && (searchQuery.trim().length > 0) && (
          <div className="search-dropdown-menu">
            {isSearching ? (
              <div className="search-dropdown-loading">
                <div className="search-spinner" /> Searching...
              </div>
            ) : searchResults.length > 0 ? (
              <ul className="search-dropdown-list">
                {searchResults.map((post) => (
                  <li 
                    key={post._id} 
                    className="search-dropdown-item"
                    onClick={() => {
                      setSelectedSearchPost(post);
                      setShowSearchDropdown(false);
                    }}
                  >
                    {post.image ? (
                      <img 
                        src={post.image} 
                        alt={post.title} 
                        className="search-item-img" 
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://placehold.co/100x100/1e293b/38bdf8?text=Img";
                        }}
                      />
                    ) : (
                      <div className="search-item-img search-item-fallback">
                        🖼️
                      </div>
                    )}
                    <div className="search-item-info">
                      <span className="search-item-title">{post.title}</span>
                      <span className="search-item-category">{post.category || "General"}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="search-dropdown-empty">
                No campaigns found for "{searchQuery}"
              </div>
            )}
          </div>
        )}
      </div>

      <div className="nav-right">
        
        <Link to="/pro" style={{ textDecoration: 'none', marginRight: '16px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #38bdf8 0%, #2563eb 100%)',
            color: '#fff',
            padding: '6px 14px',
            borderRadius: '99px',
            fontSize: '0.85rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 4px 12px rgba(56, 189, 248, 0.3)',
            transition: 'transform 0.2s',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <span role="img" aria-label="sparkles">✨</span> Pro
          </div>
        </Link>

        <div className="nav-icon">🔔</div>

        <div className="nav-profile" ref={menuRef}>

          {user ? (
            <div className="profile-wrapper">

              <img
                src={user?.avatar || "https://i.pravatar.cc/40"}
                alt={user?.name || "User"}
                className="header-avatar"
                style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover" }}
                onClick={() => setOpenMenu(!openMenu)}
              />

              {openMenu && (
                <div className="profile-dropdown">
                  <div className="dropdown-user">
                    {user.name}
                  </div>

                  <div className="dropdown-actions">
                    <button onClick={() => navigate("/profile")}>
                      Profile
                    </button>

                    <button onClick={handleLogout} className="logout-btn">
                      Logout
                    </button>
                  </div>

                </div>
              )}

            </div>
          ) : (
            <Link to="/login">
              <img
                src="https://i.pravatar.cc/40"
                alt="User"
              />
            </Link>
          )}

        </div>

      </div>

    </header>

    {selectedSearchPost && (
      <PostDetailsModal
        post={selectedSearchPost}
        onClose={() => setSelectedSearchPost(null)}
      />
    )}
    </>
  );
}

export default Header;
