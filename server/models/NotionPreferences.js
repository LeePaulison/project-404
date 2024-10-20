const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notionPreferencesSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Links to the User
  autoExport: { type: Boolean, default: false }, // Toggle for automatic exports
  exportType: { type: String, enum: ['Page', 'Database'], default: 'Page' }, // Choose between exporting as Notion Page or Database entry

  // Page-Specific Preferences
  pageHierarchy: { type: String, enum: ['flat', 'nested'], default: 'flat' }, // Page hierarchy preferences
  folderLocation: { type: String, default: '' }, // Notion folder location for the export
  tags: { type: [String], default: [] }, // Tags to organize Notion Pages
  chunkSize: { type: Number, default: 500 }, // Chunk size to break large conversations
  partNamingConvention: { type: String, default: 'Chat with AI - Part ' }, // Naming convention for split pages

  // Formatting Preferences
  formatType: { type: String, enum: ['Plain Text', 'Rich Text'], default: 'Rich Text' }, // Export as plain or rich text
  includeHeadings: { type: Boolean, default: true }, // Include headings for queries/responses
  includeCodeBlocks: { type: Boolean, default: true }, // Export code snippets as code blocks
  collapsibleSections: { type: Boolean, default: false }, // Use collapsible sections in the rich text format
  
  // Database-Specific Preferences
  databaseFields: {
    title: { type: Boolean, default: true }, // Include a title field in the Notion database
    date: { type: Boolean, default: true }, // Include date field
    userID: { type: Boolean, default: true }, // Include user ID field
    conversationContent: { type: Boolean, default: true }, // Include conversation content field
    customFields: { type: [String], default: [] }, // Custom fields for database export (e.g., Tags, Status)
  },

  lastExportedAt: { type: Date, default: null }, // Tracks last export date
  updatedAt: { type: Date, default: Date.now } // Timestamp of last update to preferences
});

// Automatically update the `updatedAt` field on save
notionPreferencesSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('NotionPreferences', notionPreferencesSchema);
