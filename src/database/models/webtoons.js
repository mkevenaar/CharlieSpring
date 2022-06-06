import mongoose from 'mongoose';

const WebtoonsSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  registeredAt: { type: Number, default: Date.now },
  rss: { type: String, required: true },
  title: { type: String, required: true },
  role: { type: String },
  lastItemDate: { type: Number, default: 0 },
});

WebtoonsSchema.index({ rss: 1, guildId: 1 }, { unique: true });

export const WebtoonsModel = mongoose.model('webtoons', WebtoonsSchema);
