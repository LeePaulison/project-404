const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the User Schema
const userSchema = new Schema({
  firebaseUIDs: { type: [{
    uid: { type: String, required: true, index: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    archived: { type: Boolean, default: false },
    archivedAt: { type: Date, default: null },
    linkedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    mergedAt: { type: Date }
  }], required: true, unique: true }, // Array of linked Firebase UIDs
  email: { type: String, index: true, sparse: true }, // Email from Google OAuth
  googleUID: { type: String, index: true, sparse: true }, // Google OAuth UID
  displayName: { type: String, sparse: true }, // Display name from OAuth (Google, Facebook, GitHub)
  photoURL: { type: String, sparse: true }, // Profile photo URL from OAuth (Google, Facebook, GitHub)
  facebookUId: { type: String, index: true, sparse: true }, // Facebook OAuth ID
  githubUId: { type: String, index: true, sparse: true }, // GitHub OAuth ID
  facebookEmail: { type: String, sparse: true }, // Email from Facebook OAuth
  githubEmail: { type: String, sparse: true }, // Email from GitHub OAuth
  notionUID: { type: String, index: true, sparse: true }, // Notion OAuth UID
  notionEmail: { type: String, sparse: true }, // Email from Notion OAuth
  notionAccessToken: { type: String, sparse: true }, // Notion OAuth access token
  notionWorkspaceId: { type: String, sparse: true }, // Notion workspace ID
  notionWorkspaceName: { type: String, sparse: true }, // Notion workspace name
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  archived: { type: Boolean, default: false },
  preferences: {
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
  },
  notionPreferences: { type: Schema.Types.ObjectId, ref: 'NotionPreferences', default: null } // Reference to the Notion-specific preferences collection
});

// Automatically update the `updatedAt` field on save
userSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Create the model and export it
module.exports = mongoose.model('User', userSchema);
