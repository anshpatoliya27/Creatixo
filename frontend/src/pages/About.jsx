import { useState } from "react";
import Sidebar from "../components/sidebar";
import Footer from "../components/Footer";
import Header from "../components/Header";
import "../styles/simple-page.css";

export default function About() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="simple-page-wrapper">
        <div className="simple-page-content">
          <h1 className="simple-page-title">About Creatixo</h1>
          <div className="simple-page-text">
            <p>
              Welcome to Creatixo, the premier platform for marketing agencies, content creators, and innovative brands to share their groundbreaking campaigns with the world.
            </p>
            <h2>Our Mission</h2>
            <p>
              At Creatixo, our mission is to empower creativity by providing a dedicated space where marketing meets art. We believe that a great campaign is more than just advertising—it's a movement that connects people, inspires change, and leaves a lasting impact.
            </p>
            <h2>What We Do</h2>
            <p>
              We curate the world's best marketing campaigns across various industries including Food, Sports, Electronics, and Tech. Whether you're an up-and-coming creator or an established global brand, Creatixo gives you the visibility and tools you need to showcase your portfolio, discover inspiration, and connect with peers.
            </p>
            <h2>Join the Movement</h2>
            <p>
              Sign up today to start building your professional portfolio, save your favorite ideas, and become a part of the fastest-growing community of creative professionals.
            </p>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}
