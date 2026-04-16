import Sidebar from "../components/sidebar";
import Footer from "../components/Footer";
import "../styles/sports.css";
import { useEffect, useState } from "react";
import Header from "../components/Header";
import PostCard from "../components/PostCard";


export default function Sports() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/posts?category=Sports")
      .then(res => res.json())
      .then(data => {
        console.log("API Response for Sports:", data);
        setPosts(data);
      });
  }, []);

  const words = [
    "Stadium Activations",
    "Global Sponsorships",
    "Athlete Partnerships",
    "Fan Engagement Campaigns"
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
              Sports Marketing That
              <span className="sports-highlight"> Moves Crowds</span>
            </h1>


            <p>
              From stadium branding to digital sponsorships,
              discover campaigns that dominate attention.
            </p>

            <button className="sports-btn">
              Explore Campaigns
            </button>
          </div>

          <div className="sports-hero-right">
            <img
              src="/images/sports-1.avif"
              alt="Sports Marketing"
            />
          </div>

        </section>

        {/* CAMPAIGN GRID */}

        <section className="sports-grid">

          <div className="sports-card">
            <img src="/images/stadium.jpeg" alt="" />
            <div className="sports-card-content">
              <h3>Stadium Brand Activation</h3>
              <p>Massive offline-to-online engagement strategy.</p>
            </div>
          </div>

          <div className="sports-card">
            <img src="/images/vk-2.jpg" alt="" />
            <div className="sports-card-content">
              <h3>Fitness Influencer Drive</h3>
              <p>High-conversion athlete collaborations.</p>
            </div>
          </div>

          <div className="sports-card">
            <img src="/images/sports-3.jpg" alt="" />
            <div className="sports-card-content">
              <h3>Global Tournament Ads</h3>
              <p>International sponsorship campaigns.</p>
            </div>
          </div>


          {posts.map(post => (
            <PostCard
              key={post._id}
              post={post}
              onDelete={(id) =>
                setPosts(posts.filter(p => p._id !== id))
              }
            />
          ))}

        </section>

        {/* STATS SECTION */}

        <section className="sports-stats">

          <div className="stat-box">
            <h2>120M+</h2>
            <p>Audience Reach</p>
          </div>

          <div className="stat-box">
            <h2>85%</h2>
            <p>Engagement Rate</p>
          </div>

          <div className="stat-box">
            <h2>240+</h2>
            <p>Brand Campaigns</p>
          </div>

        </section>

        <Footer />

      </div>
    </>
  );
}
