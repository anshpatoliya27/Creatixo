import Sidebar from "../components/sidebar";
import Footer from "../components/Footer";
import Header from "../components/Header";
import "../styles/food.css";
import { useEffect, useState } from "react";
import PostCard from "../components/PostCard";

export default function Food() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/posts?category=Food")
      .then(res => res.json())
      .then(data => {
        console.log("API Response for Food:", data);
        setPosts(data);
      });
  }, []);




  return (
    <>
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="food-wrapper">

        {/* HERO SECTION */}
        <section className="food-hero">

          <div className="food-hero-content">
            <h1>
              Food Marketing That{" "}
              <span className="food-highlight">
                Drives Cravings
              </span>
            </h1>
            <p>
              Discover powerful food brand campaigns, seasonal promotions,
              and innovative culinary marketing strategies.
            </p>
          </div>
        </section>

        {/* FILTER BAR */}
        <section className="food-filter-bar">
          <button className="filter-btn active">All</button>
          <button className="filter-btn">Restaurants</button>
          <button className="filter-btn">Beverages</button>
          <button className="filter-btn">Street Food</button>
          <button className="filter-btn">Organic</button>
        </section>

        {/* CAMPAIGN GRID */}
        <section className="food-grid">

          <div className="food-card">
            <img src="/images/bakery.jpeg" alt="Bakery" />
            <div className="food-card-content">
              <h3>Artisan Bakery Launch</h3>
              <p>Seasonal campaign driving 40% more footfall.</p>
            </div>
          </div>

          <div className="food-card">
            <img src="/images/beverages.jpeg" alt="Beverage" />
            <div className="food-card-content">
              <h3>Summer Beverage Blast</h3>
              <p>Social media influencer marketing strategy.</p>
            </div>
          </div>

          <div className="food-card">
            <img src="/images/streetfoods.jpeg" alt="Street Food" />
            <div className="food-card-content">
              <h3>Street Vendor Rebranding</h3>
              <p>Local campaign that went viral in 3 days.</p>
            </div>
          </div>

          <div className="food-card">
            <img src="/images/dehydratedfruits.png" alt="Organic Food" />
            <div className="food-card-content">
              <h3>Healthy Snacks Expansion</h3>
              <p>Organic brand growth through digital storytelling.</p>
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
