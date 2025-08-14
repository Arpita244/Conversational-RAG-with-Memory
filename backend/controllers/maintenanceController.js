import Message from "../models/Message.js";

export const purgeOldMessages = async (req, res) => {
  const { days = 90 } = req.body;
  const cutoff = new Date(Date.now() - days * 24*60*60*1000);
  const { deletedCount } = await Message.deleteMany({ timestamp: { $lt: cutoff } });
  res.json({ ok:true, deleted: deletedCount });
};
