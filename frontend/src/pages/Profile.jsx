import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import Header from "../components/Header";
import Sidebar from "../components/sidebar";
import Footer from "../components/Footer";
import EditProfileModal from "../components/EditProfileModal";
import PostDetailsModal from "../components/PostDetailsModal";
import "../styles/profile.css";

const API = "http://localhost:5000/api";

export default function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [stats, setStats] = useState({ totalPosts: 0, memberSince: "" });
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // grid | list
  const [activeTab, setActiveTab] = useState("posts"); // posts | saved | liked
  const [likedPosts, setLikedPosts] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    fetchProfile(token);
  }, [navigate]);

  const fetchProfile = async (token) => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/profile/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch profile");
      const data = await res.json();
      setUser(data.user);
      setPosts(data.posts);
      setStats(data.stats);

      // Fetch saved posts
      const savedRes = await fetch(`${API}/saved`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (savedRes.ok) {
        const savedData = await savedRes.json();
        setSavedPosts(savedData.savedPosts || []);
      }

      // Fetch liked posts
      const likedRes = await fetch(`${API}/likes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (likedRes.ok) {
        const likedData = await likedRes.json();
        setLikedPosts(likedData.likedPosts || []);
      }

    } catch (err) {
      console.error("Profile fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (payload) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API}/profile/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Update failed");

      const data = await res.json();
      setUser(data.user);

      // Update localStorage with new user data
      localStorage.setItem("user", JSON.stringify({
        _id: data.user._id,
        name: data.user.name,
        email: data.user.email,
        avatar: data.user.avatar
      }));

      setEditOpen(false);

      // Re-fetch to get updated posts with user info
      await fetchProfile(token);
    } catch (err) {
      console.error("Save profile error:", err);
      alert("Failed to update profile. Please try again.");
    }
  };

  const handleDeletePost = async (postId) => {
    const token = localStorage.getItem("token");
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      const res = await fetch(`${API}/posts/${postId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Delete failed");
      setPosts((prev) => prev.filter((p) => p._id !== postId));
      setStats((prev) => ({ ...prev, totalPosts: prev.totalPosts - 1 }));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleToggleSave = async (postId) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API}/saved/toggle/${postId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        // Automatically refetch saved posts to stay perfectly synced
        const savedRes = await fetch(`${API}/saved`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (savedRes.ok) {
          const savedData = await savedRes.json();
          const isNowSaved = savedData.savedPosts?.some(p => p._id === postId);
          setSavedPosts(savedData.savedPosts || []);
          
          if (isNowSaved) {
            toast.success("Post saved to profile!");
          } else {
            toast.success("Post removed from saved.");
          }
        }
      }
    } catch (err) {
      console.error("Toggle error:", err);
      toast.error("Failed to update saved posts.");
    }
  };

  const handleToggleLike = async (postId) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API}/likes/toggle/${postId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const likedRes = await fetch(`${API}/likes`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (likedRes.ok) {
          const likedData = await likedRes.json();
          const isNowLiked = likedData.likedPosts?.some(p => p && p._id === postId);
          setLikedPosts(likedData.likedPosts || []);
          
          if (isNowLiked) {
            toast.success("Post liked!");
          } else {
            toast.success("Like removed.");
          }
        } else {
          toast.error("Failed to sync liked posts.");
        }
      } else {
        toast.error("Error from server. Backend may need a restart.");
      }
    } catch (err) {
      console.error("Like toggle error:", err);
      toast.error("Failed to update liked posts.");
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const formatJoinDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric"
    });
  };

  const getMostUsedCategory = () => {
    if (posts.length === 0) return "None";
    const counts = {};
    posts.forEach(p => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  };

  const hasSocialLinks = user?.socialLinks && Object.values(user.socialLinks).some(v => v);
  const hasBusinessInfo = user?.businessName || user?.businessType || user?.industry;
  const hasContactInfo = user?.location || user?.website || user?.phone || user?.email;

  if (loading) {
    return (
      <>
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="profile-page">
          <div className="profile-loading">
            <div className="profile-loading-spinner" />
            <span className="profile-loading-text">Loading your profile...</span>
          </div>
        </div>
      </>
    );
  }

  if (!user) return null;

  return (
    <>
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="profile-page">

        {/* ── Cover Image ── */}
        <div className="profile-cover-section">
          {user.coverImage ? (
            <img src={user.coverImage} alt="Cover" className="profile-cover-img" />
          ) : (
            <div className="profile-cover-fallback" />
          )}
          <div className="profile-cover-gradient" />
        </div>

        {/* ── Avatar + Identity ── */}
        <div className="profile-identity">
          <div className="profile-avatar-wrapper">
            <div className="profile-avatar-ring">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="profile-avatar-img" />
              ) : (
                <div className="profile-avatar-fallback">
                  {user.name?.charAt(0)?.toUpperCase()}
                </div>
              )}
            </div>
            <div className="profile-verified-badge">✓</div>
          </div>

          <div className="profile-name-section">
            <h1 className="profile-display-name">{user.name}</h1>
            <p className="profile-username">@{user.email?.split("@")[0]}</p>
            {user.bio && <p className="profile-bio-text">{user.bio}</p>}
          </div>

          <div className="profile-actions-top">
            <button className="profile-edit-btn" onClick={() => setEditOpen(true)}>
              ✏️ Edit Profile
            </button>
            <button className="profile-share-btn" title="Share Profile">
              🔗
            </button>
          </div>
        </div>

        {/* ── Stats Strip ── */}
        <div className="profile-stats-strip">
          <div className="profile-stat-item">
            <div className="profile-stat-icon posts">📝</div>
            <div className="profile-stat-content">
              <span className="profile-stat-value">{stats.totalPosts}</span>
              <span className="profile-stat-label">Posts</span>
            </div>
          </div>
          <div className="profile-stat-item">
            <div className="profile-stat-icon joined">📅</div>
            <div className="profile-stat-content">
              <span className="profile-stat-value">{formatJoinDate(stats.memberSince)}</span>
              <span className="profile-stat-label">Member Since</span>
            </div>
          </div>
          <div className="profile-stat-item">
            <div className="profile-stat-icon category">🏷️</div>
            <div className="profile-stat-content">
              <span className="profile-stat-value">{getMostUsedCategory()}</span>
              <span className="profile-stat-label">Top Category</span>
            </div>
          </div>
        </div>

        {/* ── Content Grid ── */}
        <div className="profile-content-grid">

          {/* ── Left Side Panel ── */}
          <div className="profile-side-panel">

            {/* About Card */}
            {user.description && (
              <div className="profile-card">
                <div className="profile-card-header">
                  <span className="profile-card-icon">📖</span>
                  <span className="profile-card-title">About</span>
                </div>
                <p className="profile-description-text">{user.description}</p>
              </div>
            )}

            {/* Contact Info Card */}
            {hasContactInfo && (
              <div className="profile-card">
                <div className="profile-card-header">
                  <span className="profile-card-icon">📋</span>
                  <span className="profile-card-title">Contact Info</span>
                </div>
                <div className="profile-info-list">
                  {user.email && (
                    <div className="profile-info-row">
                      <div className="profile-info-icon">✉️</div>
                      <div className="profile-info-content">
                        <span className="profile-info-label">Email</span>
                        <span className="profile-info-value">{user.email}</span>
                      </div>
                    </div>
                  )}
                  {user.location && (
                    <div className="profile-info-row">
                      <div className="profile-info-icon">📍</div>
                      <div className="profile-info-content">
                        <span className="profile-info-label">Location</span>
                        <span className="profile-info-value">{user.location}</span>
                      </div>
                    </div>
                  )}
                  {user.website && (
                    <div className="profile-info-row">
                      <div className="profile-info-icon">🌐</div>
                      <div className="profile-info-content">
                        <span className="profile-info-label">Website</span>
                        <span className="profile-info-value">
                          <a href={user.website} target="_blank" rel="noopener noreferrer">
                            {user.website.replace(/^https?:\/\//, "")}
                          </a>
                        </span>
                      </div>
                    </div>
                  )}
                  {user.phone && (
                    <div className="profile-info-row">
                      <div className="profile-info-icon">📞</div>
                      <div className="profile-info-content">
                        <span className="profile-info-label">Phone</span>
                        <span className="profile-info-value">{user.phone}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Business Info Card */}
            {hasBusinessInfo && (
              <div className="profile-card">
                <div className="profile-card-header">
                  <span className="profile-card-icon">🏢</span>
                  <span className="profile-card-title">Business</span>
                </div>
                <div className="profile-info-list">
                  {user.businessName && (
                    <div className="profile-info-row">
                      <div className="profile-info-icon">🏷️</div>
                      <div className="profile-info-content">
                        <span className="profile-info-label">Business Name</span>
                        <span className="profile-info-value">{user.businessName}</span>
                      </div>
                    </div>
                  )}
                  {user.businessType && (
                    <div className="profile-info-row">
                      <div className="profile-info-icon">📋</div>
                      <div className="profile-info-content">
                        <span className="profile-info-label">Type</span>
                        <span className="profile-info-value">{user.businessType}</span>
                      </div>
                    </div>
                  )}
                  {user.industry && (
                    <div className="profile-info-row">
                      <div className="profile-info-icon">🏭</div>
                      <div className="profile-info-content">
                        <span className="profile-info-label">Industry</span>
                        <span className="profile-info-value">{user.industry}</span>
                      </div>
                    </div>
                  )}
                  {user.businessEmail && (
                    <div className="profile-info-row">
                      <div className="profile-info-icon">✉️</div>
                      <div className="profile-info-content">
                        <span className="profile-info-label">Business Email</span>
                        <span className="profile-info-value">{user.businessEmail}</span>
                      </div>
                    </div>
                  )}
                  {user.foundedYear && (
                    <div className="profile-info-row">
                      <div className="profile-info-icon">🗓️</div>
                      <div className="profile-info-content">
                        <span className="profile-info-label">Founded</span>
                        <span className="profile-info-value">{user.foundedYear}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Social Links Card */}
            {hasSocialLinks && (
              <div className="profile-card">
                <div className="profile-card-header">
                  <span className="profile-card-icon">🔗</span>
                  <span className="profile-card-title">Social</span>
                </div>
                <div className="profile-social-grid">
                  {user.socialLinks.instagram && (
                    <a href={user.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="profile-social-link">
                      <span className="social-icon">📸</span> Instagram
                    </a>
                  )}
                  {user.socialLinks.twitter && (
                    <a href={user.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="profile-social-link">
                      <span className="social-icon">🐦</span> Twitter
                    </a>
                  )}
                  {user.socialLinks.linkedin && (
                    <a href={user.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="profile-social-link">
                      <span className="social-icon">💼</span> LinkedIn
                    </a>
                  )}
                  {user.socialLinks.youtube && (
                    <a href={user.socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="profile-social-link">
                      <span className="social-icon">🎬</span> YouTube
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* If no side content at all, show a prompt */}
            {!user.description && !hasContactInfo && !hasBusinessInfo && !hasSocialLinks && (
              <div className="profile-card" style={{ textAlign: "center", padding: "40px 28px" }}>
                <div style={{ fontSize: "42px", marginBottom: "16px" }}>✨</div>
                <h3 style={{ color: "#ffffff", fontSize: "18px", marginBottom: "8px" }}>
                  Complete Your Profile
                </h3>
                <p style={{ color: "#64748b", fontSize: "14px", lineHeight: "1.6", marginBottom: "20px" }}>
                  Add your bio, business details, and social links to make your profile stand out.
                </p>
                <button className="profile-edit-btn" onClick={() => setEditOpen(true)}>
                  ✏️ Set Up Profile
                </button>
              </div>
            )}
          </div>

          {/* ── Right: Posts Section ── */}
          <div className="profile-posts-section">

            <div className="profile-posts-header">
              <div className="profile-tabs">
                <button 
                  className={`profile-tab ${activeTab === "posts" ? "active" : ""}`}
                  onClick={() => setActiveTab("posts")}
                >
                  My Posts <span className="profile-post-count-badge">{stats.totalPosts}</span>
                </button>
                <button 
                  className={`profile-tab ${activeTab === "saved" ? "active" : ""}`}
                  onClick={() => setActiveTab("saved")}
                >
                  Saved <span className="profile-post-count-badge">{savedPosts.length}</span>
                </button>
                <button 
                  className={`profile-tab ${activeTab === "liked" ? "active" : ""}`}
                  onClick={() => setActiveTab("liked")}
                >
                  Liked <span className="profile-post-count-badge">{likedPosts.length}</span>
                </button>
              </div>
              <div className="profile-posts-view-toggle">
                <button
                  className={`profile-view-btn ${viewMode === "grid" ? "active" : ""}`}
                  onClick={() => setViewMode("grid")}
                >
                  ▦ Grid
                </button>
                <button
                  className={`profile-view-btn ${viewMode === "list" ? "active" : ""}`}
                  onClick={() => setViewMode("list")}
                >
                  ☰ List
                </button>
              </div>
            </div>

            {(activeTab === "posts" && posts.length === 0) || (activeTab === "saved" && savedPosts.length === 0) || (activeTab === "liked" && likedPosts.length === 0) ? (
              <div className="profile-empty-state">
                <div className="profile-empty-icon">{activeTab === "posts" ? "🎨" : activeTab === "saved" ? "📌" : "❤️"}</div>
                <h3 className="profile-empty-title">
                  {activeTab === "posts" ? "No posts yet" : activeTab === "saved" ? "Nothing saved yet" : "No liked posts yet"}
                </h3>
                <p className="profile-empty-desc">
                  {activeTab === "posts" 
                    ? "Start creating amazing campaigns and they'll show up here on your profile."
                    : activeTab === "saved"
                      ? "You haven't saved any campaigns. Browse the explore page to find inspiration!"
                      : "You haven't liked any campaigns. Browse the explore page to show some love!"}
                </p>
                <button 
                  className="profile-create-btn" 
                  onClick={() => navigate(activeTab === "posts" ? "/post" : "/explore")}
                >
                  {activeTab === "posts" ? "➕ Create Your First Post" : "🔍 Browse Campaigns"}
                </button>
              </div>
            ) : (
              <div className={`profile-posts-grid ${viewMode === "list" ? "list-view" : ""}`}>
                {(activeTab === "posts" ? posts : activeTab === "saved" ? savedPosts : likedPosts).map((post) => (
                  <div className="profile-post-card" key={post._id} onClick={() => setSelectedPost(post)}>
                    <div className="profile-post-card-image-wrapper">
                      {post.image ? (
                        <img
                          src={post.image}
                          alt={post.title}
                          className="profile-post-card-image"
                        />
                      ) : (
                        <div className="profile-post-no-image">🖼️</div>
                      )}
                      <span className="profile-post-card-category">{post.category}</span>
                    </div>
                    <div className="profile-post-card-body">
                      <h3 className="profile-post-card-title">{post.title}</h3>
                      <p className="profile-post-card-desc">{post.description}</p>
                      <div className="profile-post-card-footer">
                        <span className="profile-post-card-date">
                          {formatDate(post.createdAt)}
                        </span>
                        <div className="profile-post-card-actions">
                          {activeTab === "posts" && (
                            <button
                              className="profile-post-card-action-btn"
                              title="Delete post"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeletePost(post._id);
                              }}
                            >
                              🗑️
                            </button>
                          )}
                          {activeTab === "saved" && (
                            <button
                              className="profile-post-card-action-btn"
                              title="Unsave post"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleSave(post._id);
                              }}
                            >
                              📌
                            </button>
                          )}
                          {activeTab === "liked" && (
                            <button
                              className="profile-post-card-action-btn"
                              title="Unlike post"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleLike(post._id);
                              }}
                            >
                              ❤️
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <Footer />
      </div>

      {/* ── Edit Profile Modal ── */}
      {editOpen && (
        <EditProfileModal
          user={user}
          onClose={() => setEditOpen(false)}
          onSave={handleSaveProfile}
        />
      )}

      {/* ── Post Details Modal ── */}
      {selectedPost && (
        <PostDetailsModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          isSaved={savedPosts.some((sp) => sp && sp._id === selectedPost._id)}
          onToggleSave={() => handleToggleSave(selectedPost._id)}
          isLiked={likedPosts.some((lp) => lp && lp._id === selectedPost._id)}
          onToggleLike={() => handleToggleLike(selectedPost._id)}
        />
      )}
    </>
  );
}
