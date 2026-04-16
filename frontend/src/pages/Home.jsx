import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../components/sidebar";
import Footer from "../components/Footer";
import Header from "../components/Header";
import "../styles/home.css";

const getStoredUser = () => {
  try {
    const rawUser = localStorage.getItem("user");
    return rawUser ? JSON.parse(rawUser) : null;
  } catch (error) {
    console.warn("Failed to parse stored user", error);
    return null;
  }
};

export default function Home() {
  const navigate = useNavigate();

  const [current, setCurrent] = useState(0);
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    setUser(getStoredUser());
  }, [navigate]);

  const videos = [
    "https://www.pexels.com/download/video/1201251/",
    "https://www.pexels.com/download/video/8848958/",
    "https://www.pexels.com/download/video/1448735/"
  ];

  const nextVideo = () => {
    setCurrent((prev) => (prev + 1) % videos.length);
  };

  const prevVideo = () => {
    setCurrent((prev) => (prev === 0 ? videos.length - 1 : prev - 1));
  };

  const videoRefs = useRef([]);

  useEffect(() => {
    videoRefs.current.forEach((vid, index) => {
      if (vid) {
        if (index === current) {
          vid.currentTime = 0;
          vid.play().catch(e => console.log("Play interrupted", e));
        } else {
          vid.pause();
        }
      }
    });
  }, [current]);

  return (
    <>
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="home-wrapper">

        <section className="tv-hero">
          <div className="tv-container">
            <div className="tv-frame">
              {videos.map((video, index) => (
                <video
                  key={index}
                  ref={el => videoRefs.current[index] = el}
                  src={video}
                  className={`tv-video ${index === current ? "active" : ""}`}
                  muted
                  playsInline
                  preload={index === current ? "auto" : "metadata"}
                  onEnded={() => index === current && nextVideo()}
                  style={{
                    position: index === current ? "relative" : "absolute",
                    opacity: index === current ? 1 : 0,
                    transition: "opacity 0.5s ease"
                  }}
                />
              ))}
            </div>

            <div className="tv-controls">
              <button onClick={prevVideo}>◀</button>
              <button onClick={nextVideo}>▶</button>
            </div>
          </div>

          <div className="tv-content">
            <h1>
              Marketing That <span className="highlight-word">Captures</span>
              <br /> Attention
            </h1>
            <p>
              Launch powerful campaigns, dominate digital platforms,
              and grow your brand globally with Creatixo.
            </p>
            <button className="start-btn" onClick={() => navigate("/post")}>
              Start Marketing
            </button>
          </div>
        </section>

        <section className="category-row">
          <Link to="/food" className="category-link">
            <div className="category-tile">Food</div>
          </Link>
          <Link to="/sports" className="category-link">
            <div className="category-tile">Sports</div>
          </Link>
          <Link to="/electronics" className="category-link">
            <div className="category-tile">Electronics</div>
          </Link>
          <Link to="/tech" className="category-link">
            <div className="category-tile">Tech</div>
          </Link>
        </section>

        <Footer />
      </div>
    </>
  );
}
