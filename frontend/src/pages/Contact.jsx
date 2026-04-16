import { useState } from "react";
import { toast } from "react-hot-toast";
import Sidebar from "../components/sidebar";
import Footer from "../components/Footer";
import Header from "../components/Header";
import "../styles/simple-page.css";

export default function Contact() {
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toast.error("Please fill in all fields");
      return;
    }
    
    // Simulate sending message
    toast.success("Message sent successfully! We'll get back to you soon.");
    
    setName("");
    setEmail("");
    setMessage("");
  };

  return (
    <>
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="simple-page-wrapper">
        <div className="simple-page-content">
          <h1 className="simple-page-title">Contact Us</h1>
          <div className="simple-page-text">
            <p>
              Have a question, feedback, or want to partner up? We'd love to hear from you. Fill out the form below and our team will get back to you within 24 hours.
            </p>
            
            <form className="contact-form" onSubmit={handleSubmit}>
              <input
                type="text"
                className="contact-input"
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                type="email"
                className="contact-input"
                placeholder="Your Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <textarea
                className="contact-textarea"
                placeholder="How can we help?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              ></textarea>
              <button type="submit" className="contact-btn">
                Send Message
              </button>
            </form>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}
