import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import "../styles/signup.css";

const saveAuth = (data) => {
  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));
};

export default function CompleteProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const emailFromState = location.state?.email || "";

  const [form, setForm] = useState({
    name: "",
    email: emailFromState,
    password: ""
  });
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState("");
  const [loading, setLoading] = useState(false);

  const avatars = [
    "/images/avtar-1.jpeg",
    "/images/avtar-2.jpeg",
    "/images/avtar-3.jpeg",
    "/images/avtar-4.jpeg"
  ];

  useEffect(() => {
    if (!form.email) {
      navigate("/login");
    }
  }, [form.email, navigate]);

  const validate = () => {
    const newErrors = {};

    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.password || form.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (!selectedAvatar) newErrors.avatar = "Please select an avatar";

    return newErrors;
  };

  const handleComplete = async (e) => {
    e.preventDefault();
    setGlobalError("");

    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    try {
      setLoading(true);

      const response = await fetch("http://localhost:5000/api/auth/complete-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          avatar: selectedAvatar
        })
      });

      const data = await response.json();
      console.log("Complete profile API response", { status: response.status, body: data });

      if (!response.ok) {
        setGlobalError(data.message || "Failed to complete profile");
        return;
      }

      saveAuth(data);
      navigate("/home");
    } catch (error) {
      console.error("Complete profile error:", error);
      setGlobalError("Unable to complete profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-wrapper">
      <div className="signup-card">
        <div className="signup-logo">🧩 Creatixo</div>
        <h2>Complete Your Profile</h2>

        {globalError && <div className="signup-error">{globalError}</div>}

        <form onSubmit={handleComplete}>
          <div className="signup-group">
            <input type="email" placeholder="Email" value={form.email} disabled />
          </div>

          <div className="signup-group">
            <input type="text" placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            {errors.name && <span className="signup-error">{errors.name}</span>}
          </div>

          <div className="signup-group">
            <input type="password" placeholder="Create Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            {errors.password && <span className="signup-error">{errors.password}</span>}
          </div>

          <div className="avatar-section">
            <h4>Select Your Avatar</h4>
            <div className="avatar-grid">
              {avatars.map((avatar, idx) => (
                <img
                  key={idx}
                  src={avatar}
                  alt="avatar"
                  className={`avatar-img ${selectedAvatar === avatar ? "selected" : ""}`}
                  onClick={() => setSelectedAvatar(avatar)}
                />
              ))}
            </div>
            {errors.avatar && <span className="signup-error">{errors.avatar}</span>}
          </div>

          <button type="submit" className={`signup-btn ${loading ? "loading" : ""}`} disabled={loading}>
            {loading ? "Saving Profile..." : "Complete Profile"}
          </button>
        </form>

        <div className="signup-footer">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
}
