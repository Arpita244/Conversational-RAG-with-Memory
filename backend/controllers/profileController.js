import UserProfile from "../models/UserProfile.js";

export const getProfile = async (req, res) => {
  const { userId } = req.params;
  const profile = await UserProfile.findOne({ userId }).lean();
  res.json(profile || { userId, facts: [] });
};

export const updateProfile = async (req, res) => {
  const { userId } = req.params;
  const { displayName, facts } = req.body;
  const profile = await UserProfile.findOneAndUpdate({ userId }, { displayName, facts, updatedAt: new Date() }, { upsert: true, new: true });
  res.json(profile);
};
