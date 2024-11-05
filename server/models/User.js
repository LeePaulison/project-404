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
    mergedAt: { type: Date }
  }], unique: false }, // Array of linked Firebase UIDs
  googleUID: { type: String, index: true, sparse: true }, // Google OAuth UID
  email: { type: String, index: true, sparse: true }, // Email from Google OAuth
  displayName: { type: String, sparse: true }, // Display name from OAuth (Google)
  photoURL: { type: String, sparse: true }, // Profile photo URL from OAuth (Google)
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  archived: { type: Boolean, default: false },
  archivedAt: { type: Date, default: null },
  preferences: { type: Schema.Types.ObjectId, ref: 'Preferences' },
});

// Automatically update the `updatedAt` field on save
userSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Create the model and export it
module.exports = mongoose.model('User', userSchema);
