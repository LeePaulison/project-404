const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the User Schema
const userSchema = new Schema({
  firebaseUIDs: { type: [String], required: true }, // Array of linked Firebase UIDs
  email: { type: String, index: true, sparse: true }, // Index for quick lookups on email
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  archived: { type: Boolean, default: false },
  preferences: {
    defaultTemperature: { type: Number, default: 0.7 }
  }
});

// Automatically update the `updatedAt` field on save
userSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Create the model and export it
module.exports = mongoose.model('User', userSchema);
