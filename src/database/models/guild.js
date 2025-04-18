import mongoose from 'mongoose';

const GuildSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    required: true,
  },
  registeredAt: {
    type: Number,
    default: Date.now,
  },
  addons: {
    type: Object,
    default: {
      // Extra features data
      reactions: {
        enabled: false,
        channel: null,
      },
      tapas: {
        enabled: false,
        channel: null,
      },
      webtoons: {
        enabled: false,
        channel: null,
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
