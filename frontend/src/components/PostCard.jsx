import { useState } from "react";
import { toast } from "react-hot-toast";
import PostDetailsModal from "./PostDetailsModal";
import "../styles/postcard.css";

export default function PostCard({ post, onDelete, savedPostIds = [], onToggleSave, likedPostIds = [], onToggleLike }) {

  const currentUser = (() => {
    try { return JSON.parse(localStorage.getItem("user")); }
    catch { return null; }
  })();
  const token = localStorage.getItem("token");

  const [menuOpen, setMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isOwner = currentUser && post.user?._id === currentUser._id;
  const isSaved = savedPostIds.includes(post._id);
  const isLiked = likedPostIds.includes(post._id);

  const handleDelete = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/posts/${post._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        alert("Delete failed");
        return;
      }

      onDelete?.(post._id);
      setMenuOpen(false);

    } catch (error) {
      console.log(error);
    }
  };

  const handleSave = async () => {
    if (!token) {
      toast.error("Please login to save posts");
      return;
    }
    try {
      const res = await fetch(
        `http://localhost:5000/api/saved/toggle/${post._id}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      if (res.ok) {
        const data = await res.json();
        const isNowSaved = data.saved;
        if (isNowSaved) {
          toast.success("Post saved to profile!");
        } else {
          toast.success("Post removed from saved.");
        }
        onToggleSave?.(post._id, data.saved);
      }
    } catch (err) {
      console.error("Save toggle error:", err);
      toast.error("Failed to update saved posts.");
    }
    setMenuOpen(false);
  };

  const handleLike = async () => {
    if (!token) {
      toast.error("Please login to like posts");
      return;
    }
    try {
      const res = await fetch(
        `http://localhost:5000/api/likes/toggle/${post._id}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      if (res.ok) {
        const data = await res.json();
        const isNowLiked = data.liked;
        if (isNowLiked) {
          toast.success("Post liked!");
        } else {
          toast.success("Like removed.");
        }
        onToggleLike?.(post._id, data.liked);
      }
    } catch (err) {
      console.error("Like toggle error:", err);
      toast.error("Failed to update liked posts.");
    }
    setMenuOpen(false);
  };

  return (
    <>
      <div className="postcard" onClick={() => setIsModalOpen(true)}>

        {/* 3 DOT BUTTON */}
        <div className="post-menu-wrapper">
          <button
            className="post-menu-btn"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
          >
          ⋯
        </button>

        {menuOpen && (
          <div className="post-menu-dropdown">
            <button onClick={(e) => { e.stopPropagation(); handleSave(); }}>
              {isSaved ? "📌 Unsave" : "📌 Save"}
            </button>
            <button onClick={(e) => { e.stopPropagation(); handleLike(); }}>
              {isLiked ? "💔 Unlike" : "❤️ Like"}
            </button>

            {isOwner && (
              <button
                className="delete-option"
                onClick={(e) => { e.stopPropagation(); handleDelete(); }}
              >
                🗑️ Delete
              </button>
            )}
          </div>
        )}
      </div>

      {/* SAVED INDICATOR */}
      {isSaved && (
        <div className="postcard-saved-badge">📌</div>
      )}

      {/* IMAGE */}
      {post.image && (
        <div className="postcard-image">
          <img src={post.image} alt="campaign" />
        </div>
      )}

      {/* CONTENT */}
      <div className="postcard-content">

        <div className="postcard-user">
          <img
            src={post.user?.avatar}
            alt="user"
          />
          <span>{post.user?.name}</span>
        </div>

        <h3>{post.title}</h3>
        <p>{post.description}</p>

      </div>
    </div>
    
    {isModalOpen && (
      <PostDetailsModal 
        post={post} 
        onClose={() => setIsModalOpen(false)} 
        isSaved={isSaved}
        onToggleSave={handleSave}
        isLiked={isLiked}
        onToggleLike={handleLike}
      />
    )}
    </>
  );
}