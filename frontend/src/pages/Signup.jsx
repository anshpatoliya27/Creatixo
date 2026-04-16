import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import WelcomeOverlay from "../components/WelcomeOverlay";
import "../styles/signup.css";


export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [userName, setUserName] = useState("");

  const avatars = [
    "/images/avtar-1.jpeg",
    "/images/avtar-2.jpeg",
    "/images/avtar-3.jpeg",
    "/images/avtar-4.jpeg"
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/home");
    }
  }, [navigate]);

  const validate = () => {
    const newErrors = {};

    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.email.trim()) newErrors.email = "Email or phone is required";

    if (!form.password) newErrors.password = "Password is required";
    else if (form.password.length < 6) newErrors.password = "Minimum 6 characters required";

    if (form.confirmPassword !== form.password) newErrors.confirmPassword = "Passwords do not match";

    if (!selectedAvatar) newErrors.avatar = "Please select an avatar";

    return newErrors;
  };

  const saveAuth = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalError("");

    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    try {
      setLoading(true);

      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password, avatar: selectedAvatar })
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ email: data.message || "Signup failed" });
        return;
      }

      setUserName(data.user?.name || "new user");
      setShowWelcome(true);

    } catch (error) {
      console.error("Signup error:", error);
      setGlobalError("Unable to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Google signup removed as per requirements

  const handleWelcomeComplete = () => {
    setShowWelcome(false);
    navigate("/login");
  };

  return (
    <>
      {showWelcome && <WelcomeOverlay userName={userName} onComplete={handleWelcomeComplete} />}
      <div className="signup-wrapper">
      <div className="signup-card">
        <div className="signup-logo">🧩 Creatixo</div>
        <h2>Create Your Account</h2>

        {globalError && <div className="signup-error">{globalError}</div>}

        <form onSubmit={handleSubmit}>
          <div className="signup-group">
            <input type="text" placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            {errors.name && <span className="signup-error">{errors.name}</span>}
          </div>

          <div className="signup-group">
            <input type="text" placeholder="Email or Phone" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            {errors.email && <span className="signup-error">{errors.email}</span>}
          </div>

          <div className="signup-group">
            <input type="password" placeholder="Create Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            {errors.password && <span className="signup-error">{errors.password}</span>}
          </div>

          <div className="signup-group">
            <input type="password" placeholder="Re-enter Password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} />
            {errors.confirmPassword && <span className="signup-error">{errors.confirmPassword}</span>}
          </div>

          <div className="avatar-section">
            <h4>Select Your Avatar</h4>
            <div className="avatar-grid">
              {avatars.map((avatar, index) => (
                <img key={index} src={avatar} alt="avatar" className={`avatar-img ${selectedAvatar === avatar ? "selected" : ""}`} onClick={() => setSelectedAvatar(avatar)} />
              ))}
            </div>
            {errors.avatar && <span className="signup-error">{errors.avatar}</span>}
          </div>

          <button type="submit" className={`signup-btn ${loading ? "loading" : ""}`} disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="signup-footer">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </div>
      </div>
    </>
  );
}
