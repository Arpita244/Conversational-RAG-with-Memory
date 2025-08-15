// backend/controllers/profileController.js
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

/*
  Simple profile creation endpoint for demo:
  POST /api/profile { displayName }
  Creates a user (with a generated username) and returns token
*/
export const signup = async (req, res) => {
  try {
    const { displayName } = req.body;
    if (!displayName) return res.status(400).json({ error: "displayName required" });

    // generate username sanitized + random suffix
    const base = displayName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || `user`;
    let username = base;
    // ensure uniqueness by attempting create, if fails append suffix
    let created = null;
    for (let i = 0; i < 5; i++) {
      try {
        created = await User.create({ username: i === 0 ? username : `${base}-${Math.floor(Math.random()*900)+100}`, displayName });
        break;
      } catch (e) {
        // try a new suffix
      }
    }
    if (!created) return res.status(500).json({ error: "Could not create user" });

    const token = jwt.sign({ userId: created._id.toString(), displayName: created.displayName }, process.env.JWT_SECRET, { expiresIn: "7d" });

    // return userId, displayName and token
    return res.json({ userId: created._id.toString(), displayName: created.displayName, username: created.username, token });
  } catch (err) {
    console.error("profile create error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// Placeholder login function to satisfy the import in profileRoutes.js
export const login = async (req, res) => {
    // This is a simple placeholder. A real implementation would verify credentials.
    res.status(501).json({ error: "Login not implemented for this demo." });
};

// Placeholder me function to satisfy the import in profileRoutes.js
export const me = (req, res) => {
    // Return the user's data from the authenticated token
    res.json(req.user);
};

// Placeholder logout function to satisfy the import in profileRoutes.js
export const logout = (req, res) => {
    // For a stateless JWT system, logging out simply means the client discards the token.
    res.json({ message: "Logout successful." });
};