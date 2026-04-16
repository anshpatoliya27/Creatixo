import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import WelcomeOverlay from "../components/WelcomeOverlay";
import "../styles/login.css";

const getStoredUser = () => {
  try {
    const rawUser = localStorage.getItem("user");
    return rawUser ? JSON.parse(rawUser) : null;
  } catch (error) {
    console.warn("Failed to parse stored user", error);
    return null;
  }
};

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const [showWelcome, setShowWelcome] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/home");
    }
  }, [navigate]);

  const validate = () => {
    const newErrors = {};

    if (!form.email.trim()) newErrors.email = "Email or phone is required";

    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 6) {
      newErrors.password = "Minimum 6 characters required";
    }

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

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password })
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ email: data.message || "Login failed" });
        setLoading(false);
        return;
      }

      saveAuth(data);
      const user = getStoredUser();
      setUserName(user?.name || "User");
      setShowWelcome(true);

    } catch (error) {
      console.error("Login error:", error);
      setGlobalError("Unable to login right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (res) => {
    console.log("Google callback received", res);

    if (!res?.credential) {
      setGlobalError("Google login failed: no credential returned");
      console.error("Google login: missing credential", res);
      return;
    }

    const googleToken = res.credential;
    console.log("Google id token", googleToken);

    try {
      setLoading(true);
      setGlobalError("");

      const response = await fetch("http://localhost:5000/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: googleToken })
      });

      const data = await response.json();
      console.log("Google auth API response", { status: response.status, body: data });

      if (!response.ok) {
        setGlobalError(data.message || "Google login failed");
        return;
      }

      if (data.isNewUser) {
        // Redirect to complete profile with email prefill
        navigate("/complete-profile", { state: { email: data.email } });
        return;
      }

      saveAuth(data);
      const user = getStoredUser();
      setUserName(user?.name || "User");
      setShowWelcome(true);

    } catch (error) {
      console.error("Google Login Error:", error);
      setGlobalError("Unable to login with Google right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleWelcomeComplete = () => {
    setShowWelcome(false);
    navigate("/home");
  };

  return (
    <>
      {showWelcome && <WelcomeOverlay userName={userName} onComplete={handleWelcomeComplete} />}
      <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-logo">🧩 Creatixo</div>
        <h2>Sign In to Your Account</h2>

        <div style={{ marginBottom: "20px", textAlign: "center" }}>
          {loading ? (
            <button disabled className="auth-btn">Logging in with Google...</button>
          ) : (
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => setGlobalError("Google Login Failed")}
            />
          )}
        </div>

        <p style={{ textAlign: "center", marginBottom: "15px" }}>or</p>

        {globalError && <div className="auth-error">{globalError}</div>}

        <form onSubmit={handleSubmit}>
          <div className="auth-group">
            <input
              type="text"
              placeholder="Email or Phone"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            {errors.email && <span className="auth-error">{errors.email}</span>}
          </div>

          <div className="auth-group">
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? "Hide" : "Show"}
              </span>
            </div>
            {errors.password && <span className="auth-error">{errors.password}</span>}
          </div>

          <button type="submit" className={`auth-btn ${loading ? "loading" : ""}`} disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="auth-footer">
          Don’t have an account? <Link to="/signup">Create Account</Link>
        </div>
      </div>      </div>    </>
  );
}
