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
  displayName: { type: String, sparse: true }, // Display name from OAuth (Google)
  photoURL: { type: String, sparse: true }, // Profile photo URL from OAuth (Google)
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  archived: { type: Boolean, default: false },
  preferences: { type: Schema.Types.ObjectId, ref: 'Preferences' },
});

// Automatically update the `updatedAt` field on save
userSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Create the model and export it
module.exports = mongoose.model('User', userSchema);
