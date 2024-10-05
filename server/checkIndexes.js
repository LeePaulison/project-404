const mongoose = require('mongoose');

// Replace with your MongoDB URI
const uri = 'mongodb://localhost:27017/project_404';

async function checkIndexes() {
  try {
    await mongoose.connect(uri);
    const collection = mongoose.connection.db.collection('conversations');

    // Get all indexes
    const indexes = await collection.indexes();
    console.log('Indexes:', indexes);

    // Optionally drop the index by name
    // await collection.dropIndex("conversationId_1");

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error checking indexes:', err);
  }
}

checkIndexes();
