const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const preferencesSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  defaultTemperature: { type: Number, default: 0.7 },
  theme: { type: String, default: 'light' },
  notifications: { type: Boolean, default: true },
  language: { type: String, default: 'en' },
  responseFormat: { type: String, default: 'Concise' },
  autoSave: { type: Boolean, default: true },
  dataRetention: { type: String, default: '14 days' },
  defaultPrompt: { type: String, default: '' },
  tokenUsageDisplay: { type: Boolean, default: false },
  maxTokens: { type: Number, default: 1000 },
  exportToNotion: { type: Boolean, default: false },
});

module.exports = mongoose.model('Preferences', preferencesSchema);