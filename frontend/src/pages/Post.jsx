import { useState } from "react";
import Sidebar from "../components/sidebar";
import Footer from "../components/Footer";
import Header from "../components/Header";
import "../styles/post.css";

export default function Post() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Food");
  const [images, setImages] = useState([]);
  const [published, setPublished] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];

    const reader = new FileReader();
    reader.onloadend = () => {
      setImages([reader.result]);
    };

    reader.readAsDataURL(file);
  };


  const removeImage = (index) => {
    const updated = images.filter((_, i) => i !== index);
    setImages(updated);
  };

  const handlePublish = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      alert("You must be logged in");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("http://localhost:5000/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          description,
          category,
          image: images[0]
        })
      });

      console.log('POST /api/posts response status', response.status);
      const data = await response.json();
      console.log('POST /api/posts response data', data);

      if (!response.ok) {
        alert(data.message);
        setLoading(false);
        return;
      }

      setPublished(true);

      // Reset form
      setTitle("");
      setTagline("");
      setDescription("");
      setCategory("Food");
      setImages([]);

      setTimeout(() => {
        setPublished(false);
      }, 2000);

      setLoading(false);

    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };


  return (
    <>
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="post-wrapper">

        <div className="post-header">
          <h1>Launch Your Campaign</h1>
          <p>Build something bold. Make it unforgettable.</p>
        </div>

        <div className="post-container">

          {/* LEFT EDITOR */}
          <form className="post-editor" onSubmit={handlePublish}>

            <div className="upload-zone">
              <label>
                Upload Media
                <input
                  type="file"
                  multiple
                  hidden
                  onChange={handleImageUpload}
                />
              </label>
            </div>

            <div className="image-preview-grid">
              {images.map((img, index) => (
                <div key={index} className="image-box">
                  <img src={img} alt="preview" />
                  <button onClick={() => removeImage(index)}>×</button>
                </div>
              ))}
            </div>

            <input
              className="neon-input"
              placeholder="Campaign Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <input
              className="neon-input"
              placeholder="Short Tagline"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
            />

            <textarea
              className="neon-textarea"
              placeholder="Tell your campaign story..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <select
              className="neon-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option>Food</option>
              <option>Sports</option>
              <option>Electronics</option>
              <option>Tech</option>
            </select>

            <button
              type="submit"
              disabled={loading}
              className={`publish-btn ${loading ? "loading" : ""}`}
            >
              {loading ? "Publishing..." : "Publish Campaign"}
            </button>


          </form>

          {/* RIGHT LIVE PREVIEW */}
          <div className="post-preview">

            <div className="preview-card">

              {images.length > 0 && (
                <img src={images[0]} alt="preview" />
              )}

              <div className="preview-content">
                <span className="preview-category">{category}</span>
                <h2>{title || "Your Campaign Title"}</h2>
                <h4>{tagline || "Tagline preview appears here"}</h4>
                <p>
                  {description ||
                    "Your campaign description will update live as you type..."}
                </p>
              </div>

            </div>

          </div>

        </div>

        {published && (
          <div className="publish-overlay">
            <div className="publish-animation">
              <div className="checkmark">✓</div>
              <h2>Campaign Published Successfully!</h2>
            </div>
          </div>
        )}

        <Footer />
      </div>
    </>
  );
}
