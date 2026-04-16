import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import Sidebar from "../components/sidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PostDetailsModal from "../components/PostDetailsModal";
import "../styles/explore.css";

const API = "http://localhost:5000/api";

const CATEGORIES = [
  { name: "All", icon: "✦", key: "" },
  { name: "Food", icon: "🍕", key: "Food" },
  { name: "Sports", icon: "⚽", key: "Sports" },
  { name: "Electronics", icon: "📱", key: "Electronics" },
  { name: "Tech", icon: "💻", key: "Tech" },
  { name: "Fashion", icon: "👗", key: "Fashion" },
  { name: "Travel", icon: "✈️", key: "Travel" },
  { name: "Health", icon: "💪", key: "Health" },
  { name: "Finance", icon: "📊", key: "Finance" }
];

export default function Explore() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [sortOrder, setSortOrder] = useState("newest");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [savedPostIds, setSavedPostIds] = useState([]);
  const [likedPostIds, setLikedPostIds] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);

  // ── Typewriter ──
  const slogans = [
    "Discover Trending Campaigns",
    "Marketing That Inspires",
    "Ideas That Move the World"
  ];
  const [typeText, setTypeText] = useState("");
  const [sloganIndex, setSloganIndex] = useState(0);

  useEffect(() => {
    let i = 0;
    const current = slogans[sloganIndex];
    const typing = setInterval(() => {
      setTypeText(current.slice(0, i + 1));
      i++;
      if (i === current.length) {
        clearInterval(typing);
        setTimeout(() => {
          setTypeText("");
          setSloganIndex((prev) => (prev + 1) % slogans.length);
        }, 2500);
      }
    }, 65);
    return () => clearInterval(typing);
  }, [sloganIndex]);

  // ── Fetch Posts ──
  useEffect(() => {
    fetchPosts();
  }, [activeCategory]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const url = activeCategory
        ? `${API}/posts?category=${activeCategory}`
        : `${API}/posts`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ── Fetch Saved and Liked Post IDs ──
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch(`${API}/saved/ids`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((res) => res.json())
        .then((data) => setSavedPostIds(data.savedPostIds || []))
        .catch((err) => console.error("Saved IDs fetch error:", err));

      fetch(`${API}/likes/ids`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((res) => res.json())
        .then((data) => setLikedPostIds(data.likedPostIds || []))
        .catch((err) => console.error("Liked IDs fetch error:", err));
    }
  }, []);

  // ── Filtering & Sorting ──
  const filteredPosts = posts
    .filter((p) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        p.title?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.user?.name?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortOrder === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortOrder === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      return 0;
    });

  const spotlightPost = filteredPosts.length > 0 && filteredPosts[0].image ? filteredPosts[0] : null;
  const gridPosts = spotlightPost
    ? filteredPosts.filter((p) => p._id !== spotlightPost._id)
    : filteredPosts;

  // ── Category counts ──
  const categoryCounts = {};
  posts.forEach((p) => {
    categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
  });

  // ── Helpers ──
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch { return null; }
  })();

  const token = localStorage.getItem("token");

  const handleDelete = async (postId) => {
    if (!confirm("Delete this post?")) return;
    try {
      const res = await fetch(`${API}/posts/${postId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p._id !== postId));
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
    setOpenMenuId(null);
  };

  const toggleSort = () => {
    setSortOrder((prev) => (prev === "newest" ? "oldest" : "newest"));
  };

  const handleSave = async (postId) => {
    if (!token) {
      toast.error("Please login to save posts");
      return;
    }
    try {
      const res = await fetch(`${API}/saved/toggle/${postId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const isNowSaved = data.savedPosts.includes(postId);
        setSavedPostIds(data.savedPosts);
        
        if (isNowSaved) {
          toast.success("Post saved to profile!");
        } else {
          toast.success("Post removed from saved.");
        }
      }
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Failed to save post");
    }
    setOpenMenuId(null);
  };

  const handleLike = async (postId) => {
    if (!token) {
      toast.error("Please login to like posts");
      return;
    }
    try {
      const res = await fetch(`${API}/likes/toggle/${postId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const isNowLiked = data.likedPosts.includes(postId);
        setLikedPostIds(data.likedPosts);
        
        if (isNowLiked) {
          toast.success("Post liked!");
        } else {
          toast.success("Like removed.");
        }
      } else {
        toast.error("Error from server. Backend may need a restart.");
      }
    } catch (err) {
      console.error("Like error:", err);
      toast.error("Failed to like post");
    }
    setOpenMenuId(null);
  };

  return (
    <>
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="explore-page">

        {/* ═══ HERO ═══ */}
        <section className="explore-hero">
          <div className="hero-inner">

            <div className="hero-left">
              <div className="hero-badge">
                <span className="hero-badge-dot" />
                Explore Creatixo
              </div>

              <h1>
                {typeText}
                <span className="hero-cursor" />
              </h1>

              <p className="hero-subtitle">
                Browse thousands of marketing campaigns from creators worldwide.
                Filter by category, find inspiration, and launch your next big idea.
              </p>

              <div className="hero-actions">
                <Link to="/post" className="hero-cta-btn">
                  ✦ Create Campaign
                </Link>
                <button
                  className="hero-secondary-btn"
                  onClick={() => document.querySelector('.explore-posts-container')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  ↓ Browse All
                </button>
              </div>
            </div>

            <div className="hero-right">
              <div className="hero-stat-card">
                <span className="hero-stat-icon">📊</span>
                <span className="hero-stat-number">{posts.length}</span>
                <span className="hero-stat-label">Campaigns</span>
              </div>
              <div className="hero-stat-card">
                <span className="hero-stat-icon">🏷️</span>
                <span className="hero-stat-number">{Object.keys(categoryCounts).length}</span>
                <span className="hero-stat-label">Categories</span>
              </div>
              <div className="hero-stat-card">
                <span className="hero-stat-icon">👤</span>
                <span className="hero-stat-number">
                  {[...new Set(posts.map(p => p.user?._id))].filter(Boolean).length}
                </span>
                <span className="hero-stat-label">Creators</span>
              </div>
              <div className="hero-stat-card">
                <span className="hero-stat-icon">🔥</span>
                <span className="hero-stat-number">Live</span>
                <span className="hero-stat-label">Platform</span>
              </div>
            </div>

          </div>
        </section>


        {/* ═══ SEARCH + VIEW CONTROLS ═══ */}
        <div className="explore-toolbar">
          <div className="explore-search-wrapper">
            <span className="explore-search-icon">🔍</span>
            <input
              type="text"
              className="explore-search-input"
              placeholder="Search campaigns, creators, ideas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="explore-view-controls">
            <button
              className={`explore-view-btn ${viewMode === "grid" ? "active" : ""}`}
              onClick={() => setViewMode("grid")}
            >
              ▦ Grid
            </button>
            <button
              className={`explore-view-btn ${viewMode === "list" ? "active" : ""}`}
              onClick={() => setViewMode("list")}
            >
              ☰ List
            </button>
          </div>

          <button className="explore-sort-btn" onClick={toggleSort}>
            ⇅ {sortOrder === "newest" ? "Newest" : "Oldest"}
          </button>
        </div>


        {/* ═══ CATEGORY CHIPS ═══ */}
        <div className="explore-filter-bar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              className={`explore-chip ${activeCategory === cat.key ? "active" : ""}`}
              onClick={() => setActiveCategory(cat.key)}
            >
              <span className="explore-chip-icon">{cat.icon}</span>
              {cat.name}
              {cat.key === "" && (
                <span className="explore-chip-count">{posts.length}</span>
              )}
              {cat.key && categoryCounts[cat.key] !== undefined && (
                <span className="explore-chip-count">{categoryCounts[cat.key]}</span>
              )}
            </button>
          ))}
        </div>


        {/* ═══ SPOTLIGHT (Featured Post) ═══ */}
        {spotlightPost && !searchQuery && (
          <section className="explore-spotlight">
            <div className="explore-spotlight-card">
              <div className="spotlight-image-wrap">
                <img
                  src={spotlightPost.image}
                  alt={spotlightPost.title}
                  className="spotlight-image"
                />
                <div className="spotlight-badge">⭐ Featured</div>
              </div>
              <div className="spotlight-body">
                <span className="spotlight-category">{spotlightPost.category}</span>
                <h2 className="spotlight-title">{spotlightPost.title}</h2>
                <p className="spotlight-desc">{spotlightPost.description}</p>
                <div className="spotlight-meta">
                  <div className="spotlight-author">
                    {spotlightPost.user?.avatar && (
                      <img
                        src={spotlightPost.user.avatar}
                        alt={spotlightPost.user.name}
                        className="spotlight-author-avatar"
                      />
                    )}
                    <span className="spotlight-author-name">
                      {spotlightPost.user?.name || "Creator"}
                    </span>
                  </div>
                  <span className="spotlight-date">{formatDate(spotlightPost.createdAt)}</span>
                </div>
              </div>
            </div>
          </section>
        )}


        {/* ═══ ALL POSTS GRID ═══ */}
        <div className="explore-section-header">
          <h2 className="explore-section-title">
            {searchQuery ? "Search Results" : activeCategory ? `${activeCategory} Campaigns` : "All Campaigns"}
            <span className="explore-section-count">{filteredPosts.length}</span>
          </h2>
        </div>

        <div className="explore-posts-container">
          {loading ? (
            <div className="explore-loading">
              <div className="explore-spinner" />
              <span className="explore-loading-text">Loading campaigns...</span>
            </div>
          ) : gridPosts.length === 0 ? (
            <div className="explore-empty">
              <div className="explore-empty-icon">
                {searchQuery ? "🔍" : "🎨"}
              </div>
              <h3>
                {searchQuery ? "No results found" : "No campaigns yet"}
              </h3>
              <p>
                {searchQuery
                  ? `We couldn't find anything matching "${searchQuery}". Try a different search term.`
                  : "Be the first to create a campaign in this category and inspire the community."
                }
              </p>
              {!searchQuery && (
                <button className="explore-empty-btn" onClick={() => navigate("/post")}>
                  ➕ Create Campaign
                </button>
              )}
            </div>
          ) : (
            <div className={`explore-grid ${viewMode === "list" ? "list-mode" : ""}`}>
              {gridPosts.map((post) => {
                const isOwner = currentUser && post.user?._id === currentUser._id;

                return (
                  <div className="explore-card" key={post._id} onClick={() => setSelectedPost(post)}>

                    {/* Image */}
                    <div className="explore-card-image-wrap">
                      {post.image ? (
                        <img
                          src={post.image}
                          alt={post.title}
                          className="explore-card-img"
                        />
                      ) : (
                        <div className="explore-card-no-image">🖼️</div>
                      )}

                      <span className="explore-card-category-badge">{post.category}</span>

                      {/* Menu */}
                      <div className="explore-card-menu">
                        <button
                          className="explore-card-menu-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(openMenuId === post._id ? null : post._id);
                          }}
                        >
                          ⋯
                        </button>
                        {openMenuId === post._id && (
                          <div className="explore-card-dropdown">
                            <button onClick={(e) => { e.stopPropagation(); handleSave(post._id); }}>
                              {savedPostIds.includes(post._id) ? "📌 Unsave" : "📌 Save"}
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); handleLike(post._id); }}>
                              {likedPostIds.includes(post._id) ? "💔 Unlike" : "❤️ Like"}
                            </button>
                            {isOwner && (
                              <button
                                className="delete-option"
                                onClick={(e) => { e.stopPropagation(); handleDelete(post._id); }}
                              >
                                🗑️ Delete
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Body */}
                    <div className="explore-card-body">
                      <div className="explore-card-author">
                        {post.user?.avatar && (
                          <img
                            src={post.user.avatar}
                            alt={post.user.name}
                            className="explore-card-author-avatar"
                          />
                        )}
                        <span className="explore-card-author-name">
                          {post.user?.name || "Anonymous"}
                        </span>
                      </div>

                      <h3 className="explore-card-title">{post.title}</h3>
                      <p className="explore-card-desc">{post.description}</p>

                      <div className="explore-card-footer">
                        <span className="explore-card-date">{formatDate(post.createdAt)}</span>
                        <div className="explore-card-interact">
                          <button 
                            className={`explore-card-interact-btn ${likedPostIds.includes(post._id) ? "liked-active" : ""}`}
                            title={likedPostIds.includes(post._id) ? "Unlike" : "Like"}
                            onClick={(e) => { e.stopPropagation(); handleLike(post._id); }}
                            style={{ color: likedPostIds.includes(post._id) ? '#ef4444' : 'inherit' }}
                          >
                            ❤️
                          </button>
                          <button
                            className={`explore-card-interact-btn ${savedPostIds.includes(post._id) ? "saved-active" : ""}`}
                            title={savedPostIds.includes(post._id) ? "Unsave" : "Save"}
                            onClick={(e) => { e.stopPropagation(); handleSave(post._id); }}
                          >
                            📌
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <Footer />
      </div>

      {/* ── Modal ── */}
      {selectedPost && (
        <PostDetailsModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          isSaved={savedPostIds.includes(selectedPost._id)}
          onToggleSave={() => handleSave(selectedPost._id)}
          isLiked={likedPostIds.includes(selectedPost._id)}
          onToggleLike={() => handleLike(selectedPost._id)}
        />
      )}
    </>
  );
}
