import jwt from "jsonwebtoken";

// ✅ Auth middleware - protects private routes
export const verifyToken = (req, res, next) => {
  try {
    // Get token from request header
    const token = req.headers.authorization?.split(" ")[1] || req.headers.authorization;

    if (!token) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    // Verify token using JWT_SECRET
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();

  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired. Please log in again." });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(403).json({ message: "Invalid token." });
    }
    return res.status(500).json({ message: "Token verification failed." });
  }
};

export default verifyToken;
