import Sidebar from "../components/sidebar";
import Footer from "../components/Footer";
import "../styles/electronics.css";
import { useEffect, useState } from "react";
import Header from "../components/Header";
import PostCard from "../components/PostCard";


export default function Electronics() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/posts?category=Electronics")
      .then(res => res.json())
      .then(data => {
        console.log("API Response for Electronics:", data);
        setPosts(data);
      });
  }, []);


  const words = [
    "AI Powered Devices",
    "Next-Gen Gadgets",
    "Smart Innovation",
    "Future Tech Campaigns"
  ];

  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = words[currentWordIndex];

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        setTypedText(currentWord.substring(0, typedText.length + 1));

        if (typedText === currentWord) {
          setTimeout(() => setIsDeleting(true), 1200);
        }
      } else {
        setTypedText(currentWord.substring(0, typedText.length - 1));

        if (typedText === "") {
          setIsDeleting(false);
          setCurrentWordIndex((prev) => (prev + 1) % words.length);
        }
      }
    }, isDeleting ? 40 : 80);

    return () => clearTimeout(timeout);

  }, [typedText, isDeleting, currentWordIndex]);

  return (
    <>
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="sports-wrapper">

        {/* HERO SECTION */}
        <section className="sports-hero">

          <div className="sports-hero-left">

            {/* Accent Line + Type Text */}
            <div className="sports-accent-wrapper">
              <div className="sports-accent-line"></div>
              <div className="sports-accent-text">
                {typedText}
              </div>
            </div>

            <h1>
              Electronics Marketing That
              <span className="sports-highlight"> Sparks Demand</span>
            </h1>


            <p>
              From premium gadgets to AI innovation,
              dominate digital shelves with precision campaigns.
            </p>

            <button className="sports-btn">
              Launch Tech Campaign
            </button>
          </div>

          <div className="sports-hero-right">
            <img
              src="/images/electronics-1.jpeg"
              alt="Sports Marketing"
            />
          </div>

        </section>

        {/* CAMPAIGN GRID */}

        <section className="sports-grid">

          <div className="sports-card">
            <img src="/images/electronics-2.jpg" alt="" />
            <div className="sports-card-content">
              <h3>Product Launch Strategy</h3>
              <p>Drive hype and early adoption with teaser funnels.</p>
            </div>
          </div>

          <div className="sports-card">
            <img src="/images/techinfluencer.jpg" alt="" />
            <div className="sports-card-content">
              <h3>Influencer Tech Reviews</h3>
              <p>Build credibility with trusted tech voices.</p>
            </div>
          </div>

          <div className="sports-card">
            <img src="/images/apple-visionpro.webp" alt="" />
            <div className="sports-card-content">
              <h3>Global Gadget Campaigns</h3>
              <p>Scale innovation marketing worldwide.</p>
            </div>
          </div>


          {posts.length > 0 && (
            posts.map(post => (
              <PostCard key={post._id} post={post} />
            ))
          )}

        </section>

        {/* STATS SECTION */}

        <section className="sports-stats">

          <div className="stat-box">
            <h2>180M+</h2>
            <p>Tech Audience Reach</p>
          </div>

          <div className="stat-box">
            <h2>92%</h2>
            <p>Conversion Rate</p>
          </div>

          <div className="stat-box">
            <h2>320+</h2>
            <p>Device Campaigns</p>
          </div>

        </section>

        <Footer />

      </div>
    </>
  );
}
