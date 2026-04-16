import { Link } from "react-router-dom";
import "../styles/footer.css";

function Footer() {
  return (
    <footer className="floating-footer">

      <div className="footer-left">
        <Link to="/home" className="footer-logo" style={{ textDecoration: 'none' }}>🧩 Creatixo</Link>
        <span className="footer-tagline">
          Where Brands Become Movements.
        </span>
      </div>

      <div className="footer-right">
        <Link to="/about">About</Link>
        <Link to="/privacy">Privacy</Link>
        <Link to="/terms">Terms</Link>
        <Link to="/contact">Contact</Link>
      </div>

    </footer>
  );
}

export default Footer;
