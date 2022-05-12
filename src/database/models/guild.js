import mongoose from 'mongoose';

const GuildSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    required: true,
  }, //ID of the guild
  registeredAt: {
    type: Number,
    default: Date.now,
  },
  addons: {
    type: Object,
    default: {
      // Extra features data
      reactions: {
        enabled: false, // Reactions features are enabled
        channel: null, // ID for the channel to send reaction messages to
      },
    },
  },
  categories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'reactioncategory',
    },
  ],
});

export const GuildModel = mongoose.model('guild', GuildSchema);
