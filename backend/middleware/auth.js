// backend/middleware/auth.js
import jwt from "jsonwebtoken";

export const authRequired = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach decoded payload (user info) to req
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};