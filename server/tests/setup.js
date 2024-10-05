const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

module.exports = {
  // Connect to the in-memory database
  connect: async () => {
    // If a connection exists, close it before creating a new one
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    // Create and connect to a new in-memory MongoDB server
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    await mongoose.connect(uri)
      .then(() => console.log("MongoDB connected successfully"))
      .catch(err => console.error("MongoDB connection error:", err));
  },

  // Disconnect and stop the in-memory server
  disconnect: async () => {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  },

  // Clear the database after each test
  clearDatabase: async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany();
    }
  }
};