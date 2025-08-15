import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const signup = async (req, res) => {
  try {
    const { displayName } = req.body;

    if (!displayName) {
      return res.status(400).json({ error: "displayName required" });
    }

    if (!process.env.JWT_SECRET) {
      console.error("❌ Missing JWT_SECRET in environment variables");
      return res.status(500).json({ error: "Server misconfiguration" });
    }

    // Generate base username from displayName
    const base =
      displayName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") || `user`;

    let createdUser = null;

    for (let i = 0; i < 5; i++) {
      const candidate = i === 0 ? base : `${base}-${uuidv4().slice(0, 8)}`;

      try {
        createdUser = await User.create({
          username: candidate,
          displayName,
        });
        break;
      } catch (err) {
        if (err.code !== 11000) {
          console.error("❌ Unexpected DB error:", err);
          return res.status(500).json({ error: "Database error" });
        }
      }
    }

    if (!createdUser) {
      return res.status(500).json({ error: "Username conflict" });
    }

    let token;
    try {
      token = jwt.sign(
        {
          userId: createdUser._id.toString(),
          displayName: createdUser.displayName,
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );
    } catch (err) {
      console.error("❌ JWT signing failed:", err);
      return res.status(500).json({ error: "Token generation failed" });
    }

    return res.json({
      userId: createdUser._id.toString(),
      displayName: createdUser.displayName,
      username: createdUser.username,
      token,
    });
  } catch (err) {
    console.error("❌ profile create error:", err);
    return res.status(500).json({ error: err.message || "Server error" });
  }
};

export const login = async (req, res) => {
  res.status(501).json({ error: "Login not implemented for this demo." });
};

export const me = (req, res) => {
  res.json(req.user);
};

export const logout = (req, res) => {
  res.json({ message: "Logout successful." });
};
