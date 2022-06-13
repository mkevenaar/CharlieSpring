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
      tapas: {
        enabled: false, // Tapas features are enabled
        channel: null, // ID for the channel to send tapas messages to
      },
      webtoons: {
        enabled: false, // Webtoons features are enabled
        channel: null, // ID for the channel to send webtoon messages to
      },
    },
  },
  categories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'reactioncategory',
    },
  ],
  tapas: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'tapas',
    },
  ],
  webtoons: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'webtoons',
    },
  ],
});

export const GuildModel = mongoose.model('guild', GuildSchema);
