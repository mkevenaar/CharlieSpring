import mongoose from 'mongoose';

const ReactionRoleSchema = new mongoose.Schema({
  id: { type: String }, // ID of the role
  categoryName: { type: String },
  guildId: { type: String },
  registeredAt: { type: Number, default: Date.now },
  description: { type: String },
  emoji: { type: String },
});

ReactionRoleSchema.index({ id: 1, categoryId: 1, guildId: 1 }, { unique: true });

export const ReactionRoleModel = mongoose.model('reactionrole', ReactionRoleSchema);
