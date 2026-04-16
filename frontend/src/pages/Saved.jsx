import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/sidebar";
import Footer from "../components/Footer";
import PostCard from "../components/PostCard";
import "../styles/saved.css";

const API = "http://localhost:5000/api";

export default function Saved() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [savedPosts, setSavedPosts] = useState([]);
  const [savedPostIds, setSavedPostIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    fetchSavedPosts(token);
  }, [navigate]);

  const fetchSavedPosts = async (token) => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/saved`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch saved posts");
      const data = await res.json();
      setSavedPosts(data.savedPosts || []);
      setSavedPostIds((data.savedPosts || []).map(p => p._id));
    } catch (err) {
      console.error("Fetch saved posts error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSave = (postId, isNowSaved) => {
    if (!isNowSaved) {
      // Remove from view if unsaved
      setSavedPosts(prev => prev.filter(p => p._id !== postId));
      setSavedPostIds(prev => prev.filter(id => id !== postId));
    }
  };

  const handleDeletePost = (postId) => {
    setSavedPosts(prev => prev.filter(p => p._id !== postId));
    setSavedPostIds(prev => prev.filter(id => id !== postId));
  };

  return (
    <>
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="saved-page">
        <div className="saved-header">
          <h1 className="saved-title">📌 Saved Campaigns</h1>
          <p className="saved-subtitle">
            Your personal collection of inspiring marketing campaigns, ideas, and designs.
          </p>
        </div>

        <div className="saved-content">
          {loading ? (
            <div className="explore-loading">
              <div className="explore-spinner" />
              <span className="explore-loading-text">Loading saved posts...</span>
            </div>
          ) : savedPosts.length === 0 ? (
            <div className="saved-empty">
              <div className="saved-empty-icon">📍</div>
              <h3>Nothing saved yet</h3>
              <p>
                Browse the explore page to find amazing marketing campaigns and save the ones you love.
              </p>
              <Link to="/explore" className="saved-explore-btn">
                🔍 Explore Campaigns
              </Link>
            </div>
          ) : (
            <div className="saved-grid">
              {savedPosts.map((post) => (
                <PostCard 
                  key={post._id} 
                  post={post} 
                  onDelete={handleDeletePost}
                  savedPostIds={savedPostIds}
                  onToggleSave={handleToggleSave}
                />
              ))}
            </div>
          )}
        </div>

        <Footer />
      </div>
    </>
  );
}
