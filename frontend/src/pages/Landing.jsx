import { useEffect, useState } from "react";
import "../styles/landing.css";
import { Link } from "react-router-dom";

function Landing() {

  /* =========================
     HERO IMAGE SLIDER
  ========================== */

  const [heroIndex, setHeroIndex] = useState(0);

  const images = [
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
    "/images/dehydratedfruits.png",
    "/images/apple-headphones.avif"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % images.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  /* =========================
     TYPEWRITER EFFECT
  ========================== */

  const words = ["Movements", "Experiences", "Influence", "Power"];

  const [wordIndex, setWordIndex] = useState(0);
  const [typedWord, setTypedWord] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = words[wordIndex];
    let typingSpeed = isDeleting ? 50 : 100;

    const handleTyping = () => {
      if (!isDeleting) {
        setTypedWord(currentWord.substring(0, typedWord.length + 1));

        if (typedWord === currentWord) {
          setTimeout(() => setIsDeleting(true), 1200);
        }
      } else {
        setTypedWord(currentWord.substring(0, typedWord.length - 1));

        if (typedWord === "") {
          setIsDeleting(false);
          setWordIndex((prev) => (prev + 1) % words.length);
        }
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);

  }, [typedWord, isDeleting, wordIndex]);

  /* =========================
     SCROLL ANIMATION
  ========================== */

  useEffect(() => {
    const boxes = document.querySelectorAll(".feature-box");

    const handleScroll = () => {
      boxes.forEach((box) => {
        const position = box.getBoundingClientRect().top;
        if (position < window.innerHeight - 100) {
          box.style.opacity = 1;
          box.style.transform = "translateY(0)";
        }
      });
    };

    boxes.forEach((box) => {
      box.style.opacity = 0;
      box.style.transform = "translateY(40px)";
      box.style.transition = "0.6s ease";
    });

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);

  }, []);

  return (
    <>
      {/* NAVBAR */}
      <div className="landing-navbar">
        <Link to="/" className="landing-logo">🧩 Creatixo</Link>

        <div className="landing-nav-links">
          <Link to="/home">Home</Link>
          <Link to="/explore">Explore</Link>
          <Link to="/login">Login</Link>
        </div>
      </div>

      {/* HERO SECTION */}
      <section className="landing-hero">

        {/* LEFT SLIDER */}
        <div className="landing-hero-left">
          {images.map((img, index) => (
            <div
              key={index}
              className={`landing-hero-slide ${
                index === heroIndex ? "active" : ""
              }`}
            >
              <img src={img} alt="slide" />
            </div>
          ))}
        </div>

        {/* RIGHT CONTENT */}
        <div className="landing-hero-right">
          <h1 className="landing-title">
            Where Brands Become{" "}
            <span className="typewriter-word">
              {typedWord}
            </span>
          </h1>

          <p className="landing-subtitle">
            Showcase your products. Build powerful campaigns.
            Connect with audiences worldwide.
          </p>

          <Link to="/signup">
            <button className="landing-btn">
              Launch Your Brand
            </button>
          </Link>
        </div>

      </section>

      {/* FEATURES */}
      <section className="landing-features">
        <div className="feature-box">
          <h4>🚀 Growth Focused</h4>
          <p>Scale your brand with intelligent marketing exposure.</p>
        </div>

        <div className="feature-box">
          <h4>📊 Smart Analytics</h4>
          <p>Understand engagement with powerful insights.</p>
        </div>

        <div className="feature-box">
          <h4>🌍 Global Reach</h4>
          <p>Connect with audiences worldwide.</p>
        </div>
      </section>

      {/* FOOTER */}
      <div className="landing-footer">
        © 2026 Creatixo. All Rights Reserved.
      </div>
    </>
  );
}

export default Landing;
