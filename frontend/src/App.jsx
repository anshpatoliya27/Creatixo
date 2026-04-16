import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "react-hot-toast";

import Landing from "./pages/Landing";
import Home from "./pages/Home";
import Food from "./pages/food";
import Explore from "./pages/Explore";
import Sports from "./pages/sports";
import Electronics from "./pages/Electronics";
import Tech from "./pages/Tech";
import Post from "./pages/post";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import CompleteProfile from "./pages/CompleteProfile";
import Profile from "./pages/Profile";
import Saved from "./pages/Saved";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Contact from "./pages/Contact";

function App() {
  return (
    <GoogleOAuthProvider clientId="804332973682-9me37ot03149eqs5bi265f847d1rpv58.apps.googleusercontent.com">
      <BrowserRouter>
        <Toaster 
          position="bottom-center"
          toastOptions={{
            style: {
              background: '#1e293b',
              color: '#fff',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)',
              padding: '16px',
            },
            success: {
              iconTheme: {
                primary: '#38bdf8',
                secondary: '#fff',
              },
            },
          }}
        />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/home" element={<Home />} />
          <Route path="/food" element={<Food />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/sports" element={<Sports />} />
          <Route path="/electronics" element={<Electronics />} />
          <Route path="/tech" element={<Tech />} />
          <Route path="/post" element={<Post />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/complete-profile" element={<CompleteProfile />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/saved" element={<Saved />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;