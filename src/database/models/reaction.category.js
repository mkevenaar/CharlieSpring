import mongoose from 'mongoose';

const ReactionCategorySchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  registeredAt: { type: Number, default: Date.now },
  name: { type: String, required: true },
  description: { type: String },
  color: { type: String },
  messageId: { type: String },
  roles: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'reactionrole',
    },
  ],
});

ReactionCategorySchema.index({ name: 1, guildId: 1 }, { unique: true });

export const ReactionCategoryModel = mongoose.model('reactioncategory', ReactionCategorySchema);
