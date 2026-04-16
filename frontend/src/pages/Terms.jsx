import { useState } from "react";
import Sidebar from "../components/sidebar";
import Footer from "../components/Footer";
import Header from "../components/Header";
import "../styles/simple-page.css";

export default function Terms() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="simple-page-wrapper">
        <div className="simple-page-content">
          <h1 className="simple-page-title">Terms of Service</h1>
          <div className="simple-page-text">
            <p>Last updated: October 2023</p>
            <p>
              These Terms of Service govern your access to and use of Creatixo and its associated services. Please read them carefully.
            </p>
            <h2>Acceptance of Terms</h2>
            <p>
              By accessing or using our platform, you agree to comply with and be bound by these Terms. If you do not agree, please do not use Creatixo.
            </p>
            <h2>User Content</h2>
            <p>
              When you post content on Creatixo, you retain all ownership rights. However, by uploading content, you grant us a worldwide, non-exclusive, royalty-free license to use, copy, reproduce, process, adapt, and display that content across our services. You are entirely responsible for the content you submit and must ensure you have the rights to share it.
            </p>
            <h2>Prohibited Conduct</h2>
            <p>
              You may not use our platform to post illegal content, infringe on intellectual property, spam others, or distribute malicious software. We reserve the right to suspend accounts that violate these guidelines without prior notice.
            </p>
            <h2>Modifications</h2>
            <p>
              We may revise these Terms of Service over time. By continuing to access or use the platform after revisions become effective, you agree to be bound by the revised terms.
            </p>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}
