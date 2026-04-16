import { useState } from "react";
import Sidebar from "../components/sidebar";
import Footer from "../components/Footer";
import Header from "../components/Header";
import "../styles/simple-page.css";

export default function Privacy() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="simple-page-wrapper">
        <div className="simple-page-content">
          <h1 className="simple-page-title">Privacy Policy</h1>
          <div className="simple-page-text">
            <p>Last updated: October 2023</p>
            <p>
              Your privacy is crucially important to us at Creatixo. This Privacy Policy outlines how we collect, use, and protect your personal information when you use our platform.
            </p>
            <h2>Information We Collect</h2>
            <p>
              When you create an account, we may collect information such as your name, email address, profile picture, and bio. If you submit campaigns, any images, descriptions, and metadata associated with those campaigns are also collected.
            </p>
            <h2>How We Use Your Information</h2>
            <p>
              We use your data strictly to provide, personalize, and improve our services. Your portfolio and profile information is made public to allow other creators to discover and interact with your work.
            </p>
            <h2>Data Security</h2>
            <p>
              We employ industry-standard encryption protocols and secure databases to protect against unauthorized access, alteration, disclosure, or destruction of your personal information.
            </p>
            <h2>Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please reach out to our team through the Contact page.
            </p>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}
