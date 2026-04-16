import { useState, useRef } from "react";

export default function EditProfileModal({ user, onClose, onSave }) {
  const [form, setForm] = useState({
    name: user.name || "",
    bio: user.bio || "",
    description: user.description || "",
    location: user.location || "",
    website: user.website || "",
    phone: user.phone || "",
    businessName: user.businessName || "",
    businessType: user.businessType || "",
    businessEmail: user.businessEmail || "",
    industry: user.industry || "",
    foundedYear: user.foundedYear || "",
    socialLinks: {
      instagram: user.socialLinks?.instagram || "",
      twitter: user.socialLinks?.twitter || "",
      linkedin: user.socialLinks?.linkedin || "",
      youtube: user.socialLinks?.youtube || ""
    }
  });

  const [avatarPreview, setAvatarPreview] = useState(user.avatar || "");
  const [coverPreview, setCoverPreview] = useState(user.coverImage || "");
  const [avatarFile, setAvatarFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const avatarRef = useRef();
  const coverRef = useRef();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSocialChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [name]: value }
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCoverFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setCoverPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form
      };

      // If user selected new avatar file, send as base64
      if (avatarFile) {
        payload.avatar = avatarPreview; // base64 string
      }

      // If user selected new cover file, send as base64
      if (coverFile) {
        payload.coverImage = coverPreview; // base64 string
      }

      await onSave(payload);
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="edit-profile-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="edit-profile-modal">

        {/* Header */}
        <div className="edit-modal-header">
          <h2>Edit Profile</h2>
          <button className="edit-modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <div className="edit-modal-body">

          {/* Cover Image */}
          <div className="edit-section">
            <div className="edit-section-title">📸 Cover Image</div>
            <div className="edit-cover-zone" onClick={() => coverRef.current.click()}>
              {coverPreview ? (
                <img src={coverPreview} alt="Cover" className="edit-cover-preview" />
              ) : (
                <div className="edit-cover-placeholder">
                  <span>🖼️</span>
                  <span>Click to upload cover image</span>
                </div>
              )}
            </div>
            <input
              type="file"
              ref={coverRef}
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleCoverChange}
            />
          </div>

          {/* Avatar */}
          <div className="edit-section">
            <div className="edit-section-title">👤 Profile Photo</div>
            <div className="edit-avatar-zone">
              <div className="edit-avatar-preview-wrapper" onClick={() => avatarRef.current.click()}>
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="edit-avatar-preview" />
                ) : (
                  <div className="edit-avatar-fallback">
                    {user.name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                )}
                <div className="edit-avatar-overlay">📷</div>
              </div>
              <div className="edit-avatar-info">
                <h4>Profile Photo</h4>
                <p>Click to change your profile picture</p>
              </div>
            </div>
            <input
              type="file"
              ref={avatarRef}
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleAvatarChange}
            />
          </div>

          {/* Basic Info */}
          <div className="edit-section">
            <div className="edit-section-title">✨ Basic Information</div>
            <div className="edit-form-grid">
              <div className="edit-form-group">
                <label className="edit-form-label">Display Name</label>
                <input
                  className="edit-form-input"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your name"
                />
              </div>
              <div className="edit-form-group">
                <label className="edit-form-label">Location</label>
                <input
                  className="edit-form-input"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="City, Country"
                />
              </div>
              <div className="edit-form-group full-width">
                <label className="edit-form-label">Bio</label>
                <input
                  className="edit-form-input"
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  placeholder="A short tagline about yourself"
                  maxLength={160}
                />
              </div>
              <div className="edit-form-group full-width">
                <label className="edit-form-label">About</label>
                <textarea
                  className="edit-form-textarea"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Tell people about yourself, your skills, and what you do..."
                  maxLength={500}
                  rows={3}
                />
              </div>
              <div className="edit-form-group">
                <label className="edit-form-label">Website</label>
                <input
                  className="edit-form-input"
                  name="website"
                  value={form.website}
                  onChange={handleChange}
                  placeholder="https://yourwebsite.com"
                />
              </div>
              <div className="edit-form-group">
                <label className="edit-form-label">Phone</label>
                <input
                  className="edit-form-input"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>
            </div>
          </div>

          {/* Business Info */}
          <div className="edit-section">
            <div className="edit-section-title">🏢 Business Information</div>
            <div className="edit-form-grid">
              <div className="edit-form-group">
                <label className="edit-form-label">Business Name</label>
                <input
                  className="edit-form-input"
                  name="businessName"
                  value={form.businessName}
                  onChange={handleChange}
                  placeholder="Your business name"
                />
              </div>
              <div className="edit-form-group">
                <label className="edit-form-label">Business Type</label>
                <input
                  className="edit-form-input"
                  name="businessType"
                  value={form.businessType}
                  onChange={handleChange}
                  placeholder="e.g. Agency, Startup, Freelancer"
                />
              </div>
              <div className="edit-form-group">
                <label className="edit-form-label">Business Email</label>
                <input
                  className="edit-form-input"
                  name="businessEmail"
                  value={form.businessEmail}
                  onChange={handleChange}
                  placeholder="business@example.com"
                />
              </div>
              <div className="edit-form-group">
                <label className="edit-form-label">Industry</label>
                <input
                  className="edit-form-input"
                  name="industry"
                  value={form.industry}
                  onChange={handleChange}
                  placeholder="e.g. Marketing, Tech, Finance"
                />
              </div>
              <div className="edit-form-group">
                <label className="edit-form-label">Founded Year</label>
                <input
                  className="edit-form-input"
                  name="foundedYear"
                  value={form.foundedYear}
                  onChange={handleChange}
                  placeholder="e.g. 2024"
                />
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="edit-section">
            <div className="edit-section-title">🔗 Social Links</div>
            <div className="edit-form-grid">
              <div className="edit-form-group">
                <label className="edit-form-label">Instagram</label>
                <input
                  className="edit-form-input"
                  name="instagram"
                  value={form.socialLinks.instagram}
                  onChange={handleSocialChange}
                  placeholder="https://instagram.com/username"
                />
              </div>
              <div className="edit-form-group">
                <label className="edit-form-label">Twitter / X</label>
                <input
                  className="edit-form-input"
                  name="twitter"
                  value={form.socialLinks.twitter}
                  onChange={handleSocialChange}
                  placeholder="https://twitter.com/username"
                />
              </div>
              <div className="edit-form-group">
                <label className="edit-form-label">LinkedIn</label>
                <input
                  className="edit-form-input"
                  name="linkedin"
                  value={form.socialLinks.linkedin}
                  onChange={handleSocialChange}
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
              <div className="edit-form-group">
                <label className="edit-form-label">YouTube</label>
                <input
                  className="edit-form-input"
                  name="youtube"
                  value={form.socialLinks.youtube}
                  onChange={handleSocialChange}
                  placeholder="https://youtube.com/@channel"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="edit-modal-footer">
          <button className="edit-cancel-btn" onClick={onClose}>Cancel</button>
          <button
            className={`edit-save-btn ${saving ? "saving" : ""}`}
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

      </div>
    </div>
  );
}
