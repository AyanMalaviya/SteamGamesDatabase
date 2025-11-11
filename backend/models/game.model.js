const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  appid: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  release_date: { type: Date },
  required_age: { type: Number, default: 0 },
  price: { type: Number, default: 0 },
  dlc_count: { type: Number, default: 0 },
  detailed_description: { type: String },
  about_the_game: { type: String },
  short_description: { type: String },
  reviews: { type: String },
  header_image: { type: String },
  website: { type: String },
  support_url: { type: String },
  support_email: { type: String },
  windows: { type: Boolean },
  mac: { type: Boolean },
  linux: { type: Boolean },
  metacritic_score: { type: Number, default: 0 },
  metacritic_url: { type: String },
  achievements: { type: Number, default: 0 },
  recommendations: { type: Number, default: 0 },
  notes: { type: String },
  supported_languages: [String],
  full_audio_languages: [String],
  packages: [mongoose.Schema.Types.Mixed], // Use Mixed for arrays with varied content
  developers: [String],
  publishers: [String],
  categories: [String],
  genres: [String],
  screenshots: [mongoose.Schema.Types.Mixed],
  movies: [mongoose.Schema.Types.Mixed],
  user_score: { type: Number, default: 0 },
  score_rank: { type: String }, // Can be a string or number
  positive: { type: Number, default: 0 },
  negative: { type: Number, default: 0 },
  estimated_owners: { type: String },
  average_playtime_forever: { type: Number, default: 0 },
  average_playtime_2weeks: { type: Number, default: 0 },
  median_playtime_forever: { type: Number, default: 0 },
  median_playtime_2weeks: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  peak_ccu: { type: Number, default: 0 },
  tags: [String],
  pct_pos_total: { type: Number, default: 0 },
  num_reviews_total: { type: Number, default: 0 },
  pct_pos_recent: { type: Number, default: 0 },
  num_reviews_recent: { type: Number, default: 0 },
  isFavorite: { type: Boolean, default: false }
}, { timestamps: true,
    collection: 'GameSales'
 });

const Game = mongoose.model('Game', gameSchema);

module.exports = Game;
