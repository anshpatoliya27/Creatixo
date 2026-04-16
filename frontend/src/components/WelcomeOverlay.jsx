import { useEffect, useRef } from "react";
import "../styles/welcome-overlay.css";

export default function WelcomeOverlay({ userName, onComplete }) {
  const containerRef = useRef(null);

  useEffect(() => {
    // Trigger confetti animation
    createConfetti();

    // Auto-redirect after 2.5 seconds
    const timer = setTimeout(() => {
      if (onComplete) {
        onComplete();
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  const createConfetti = () => {
    if (!containerRef.current) return;

    const confettiElements = Array.from({ length: 50 }, (_, i) => {
      const confetti = document.createElement("div");
      confetti.className = "confetti";
      confetti.style.left = Math.random() * 100 + "%";
      confetti.style.delay = Math.random() * 0.5 + "s";
      confetti.style.backgroundColor = getRandomColor();
      confetti.style.animation = `fall ${2 + Math.random() * 1}s linear forwards`;
      containerRef.current.appendChild(confetti);
      return confetti;
    });

    // Cleanup confetti elements after animation
    setTimeout(() => {
      confettiElements.forEach((el) => el.remove());
    }, 3000);
  };

  const getRandomColor = () => {
    const colors = [
      "#FF6B9D", // Pink
      "#FFA500", // Orange
      "#FFD700", // Gold
      "#98D8C8", // Mint
      "#7B68EE", // Purple
      "#FF69B4", // Hot Pink
      "#20B2AA", // Teal
      "#FF8C94"  // Coral
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <div ref={containerRef} className="welcome-overlay">
      <div className="overlay-backdrop"></div>
      <div className="overlay-content">
        <div className="welcome-text-container">
          <h1 className="welcome-text">
            Welcome to Creatixo, {userName || "User"}! 🎉
          </h1>
          <p className="welcome-subtitle">Ready to create something amazing?</p>
        </div>
        <div className="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
}
