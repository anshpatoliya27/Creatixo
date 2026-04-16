import { useEffect, useState } from "react";
import Sidebar from "../components/sidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../styles/tech.css";
import PostCard from "../components/PostCard";

export default function Tech() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/posts?category=Tech")
      .then(res => res.json())
      .then(data => {
        console.log("API Response for Tech:", data);
        setPosts(data);
      });
  }, []);

  const words = [
    "AI Systems",
    "Cloud Infrastructure",
    "Automation Platforms",
    "Blockchain Networks",
    "SaaS Ecosystems"
  ];

  const [wordIndex, setWordIndex] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = words[wordIndex];

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
          setWordIndex((prev) => (prev + 1) % words.length);
        }
      }
    }, isDeleting ? 35 : 70);

    return () => clearTimeout(timeout);
  }, [typedText, isDeleting, wordIndex]);

  return (
    <>
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="tech-wrapper">

        {/* HERO */}
        <section className="tech-hero">

          <div className="tech-hero-left">

            <div className="tech-typewriter">
              {typedText}
            </div>


            <h1>
              Where Innovation
              <br />
              <span>Becomes Market Power</span>
            </h1>

            <p>
              Design precision campaigns for emerging technologies,
              AI-driven systems, and future-ready digital products.
            </p>

            <button className="tech-primary-btn">
              Launch Tech Campaign
            </button>

          </div>

          <div className="tech-hero-right">
            <img
              src="/images/tech-1.webp"
              alt="Technology"
            />
          </div>

        </section>

        {/* CAMPAIGN CARDS */}
        <section className="tech-cards">

          <div className="tech-card">
            <img src="/images/tech-2.jpeg" alt="" />
            <div className="tech-card-content">
              <span className="tech-tag">AI</span>
              <h3>Artificial Intelligence Growth Strategy</h3>
              <p>
                Position your AI product as a category leader
                using precision digital funnels.
              </p>
            </div>
          </div>

          <div className="tech-card">
            <img src="/images/cloudtech.jpg" alt="" />
            <div className="tech-card-content">
              <span className="tech-tag">Cloud</span>
              <h3>Cloud Platform Market Expansion</h3>
              <p>
                Expand infrastructure products globally with
                enterprise-level positioning.
              </p>
            </div>
          </div>

          <div className="tech-card">
            <img src="/images/automation.jpg" alt="" />
            <div className="tech-card-content">
              <span className="tech-tag">Automation</span>
              <h3>Automation & SaaS Scaling Systems</h3>
              <p>
                Build recurring revenue models through
                high-performance marketing campaigns.
              </p>
            </div>
          </div>

          {posts.length > 0 && (
            posts.map(post => (
              <PostCard key={post._id} post={post} />
            ))
          )}


        </section>

        <Footer />

      </div>
    </>
  );
}
