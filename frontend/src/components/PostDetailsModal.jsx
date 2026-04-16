import { useState, useEffect } from "react";
import "../styles/post-modal.css";

export default function PostDetailsModal({ post, onClose, isSaved, onToggleSave, isLiked, onToggleLike }) {
  // Prevent scrolling on body when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  if (!post) return null;

  const formatDate = (dateString) => {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", options);
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="post-modal-overlay" onClick={onClose}>
      <button className="post-modal-close" onClick={onClose}>
        ✕
      </button>

      <div
        className="post-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Side: Image */}
        <div className="post-modal-image-section">
          {post.image ? (
            <img src={post.image} alt={post.title} />
          ) : (
            <div className="post-modal-no-image">
              <span className="no-img-icon">🖼️</span>
            </div>
          )}
        </div>

        {/* Right Side: Details */}
        <div className="post-modal-details-section">
          <div className="post-modal-header">
            <div className="post-modal-author">
              {post.user?.avatar ? (
                <img src={post.user.avatar} alt={post.user.name} className="author-avatar" />
              ) : (
                <div className="author-avatar-fallback">
                  {post.user?.name?.charAt(0) || "U"}
                </div>
              )}
              <div className="author-info">
                <h3>{post.user?.name || "Anonymous"}</h3>
                <span className="author-username">@{post.user?.email ? post.user.email.split("@")[0] : "user"}</span>
              </div>
            </div>
            
            <div className="post-modal-category">
              <span className="category-badge">{post.category || "Uncategorized"}</span>
            </div>
          </div>

          <div className="post-modal-body-scroll">
            <h1 className="post-modal-title">{post.title}</h1>
            
            <div className="post-modal-description">
              <p>{post.description}</p>
            </div>
          </div>

          <div className="post-modal-footer">
            <div className="post-modal-meta">
              <div className="meta-item">
                <span className="meta-icon">📅</span>
                <span className="meta-text">{post.createdAt ? formatDate(post.createdAt) : "Recently"}</span>
              </div>
              <div className="meta-item">
                <span className="meta-icon">⏰</span>
                <span className="meta-text">{post.createdAt ? formatTime(post.createdAt) : "N/A"}</span>
              </div>
            </div>
            
            <div className="post-modal-actions">
              <button 
                className={`modal-action-btn like-btn ${isLiked ? "liked-active" : ""}`}
                onClick={() => onToggleLike?.()}
              >
                {isLiked ? "💔 Unlike" : "❤️ Like"}
              </button>
              <button 
                className={`modal-action-btn save-btn ${isSaved ? "saved-active" : ""}`}
                onClick={() => onToggleSave?.()}
              >
                {isSaved ? "📌 Unsave" : "📌 Save"}
              </button>
              <button className="modal-action-btn share-btn" onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert("Link copied to clipboard!");
              }}>🔗 Share</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
