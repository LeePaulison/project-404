const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index'); // Import the raw Express app
const { connect, disconnect, clearDatabase } = require('./setup'); // Import test setup helpers
const User = require('../models/User');
const Conversation = require('../models/Conversation');

describe('Conversations API Tests', () => {
  let testUser;

  // Set up the database before running tests
  beforeAll(async () => {
    await connect();
  });

  // Clear the database and create a test user before each test
  beforeEach(async () => {
    await clearDatabase();

    // Create a test user to associate with the conversations
    testUser = new User({
      firebaseUIDs: ['test-uid'],
      email: 'testuser@example.com'
    });
    await testUser.save();
  });

  // Disconnect after all tests are done
  afterAll(async () => {
    await disconnect();
  });

  // Test 1: Create a New Conversation
  test('should create a new conversation for a user', async () => {
    const res = await request(app)
      .post('/api/conversations')
      .send({
        userId: testUser._id.toString(),
        conversationTitle: 'Test Conversation',
        messages: [{ role: 'user', content: 'Hello, this is a test conversation!' }]
      });

    expect(res.status).toBe(201); // Check for Created status
    expect(res.body).toHaveProperty('_id'); // The response should have an `_id` property
    expect(res.body.conversationTitle).toBe('Test Conversation'); // Verify the title
    expect(res.body.messages.length).toBe(1); // There should be one message
    expect(res.body.messages[0].content).toBe('Hello, this is a test conversation!'); // Verify the message content
  });

  // Test 2: Fetch a Conversation by ID
  test('should fetch a conversation by ID', async () => {
    // Create a conversation manually
    const conversation = new Conversation({
      userId: testUser._id,
      conversationTitle: 'Fetch Test Conversation',
      messages: [{ role: 'user', content: 'This is a fetch test message.' }]
    });
    await conversation.save();

    // Fetch the conversation using its ID
    const res = await request(app).get(`/api/conversations/${conversation._id.toString()}`);

    expect(res.status).toBe(200); // Check for OK status
    expect(res.body).toHaveProperty('conversationTitle', 'Fetch Test Conversation'); // Verify the title
    expect(res.body.messages[0].content).toBe('This is a fetch test message.'); // Verify the message content
  });

  // Test 3: Update a Conversation’s Title
  test('should update a conversation’s title', async () => {
    // Create a conversation manually
    const conversation = new Conversation({
      userId: testUser._id,
      conversationTitle: 'Old Title',
      messages: [{ role: 'user', content: 'Update test message.' }]
    });
    await conversation.save();

    // Update the conversation’s title
    const res = await request(app)
      .put(`/api/conversations/${conversation._id.toString()}`)
      .send({ conversationTitle: 'New Title' });

    expect(res.status).toBe(200); // Check for OK status
    expect(res.body).toHaveProperty('conversationTitle', 'New Title'); // Verify the updated title
  });

  // Test 4: Delete a Conversation by ID
  test('should delete a conversation by ID', async () => {
    // Create a conversation manually
    const conversation = new Conversation({
      userId: testUser._id,
      conversationTitle: 'Delete Test Conversation',
      messages: [{ role: 'user', content: 'Delete this message.' }]
    });
    await conversation.save();

    // Delete the conversation using its ID
    const res = await request(app).delete(`/api/conversations/${conversation._id.toString()}`);
    expect(res.status).toBe(200); // Check for OK status
    expect(res.body).toHaveProperty('message', 'Conversation deleted successfully'); // Check success message

    // Attempt to fetch the deleted conversation
    const fetchRes = await request(app).get(`/api/conversations/${conversation._id.toString()}`);
    expect(fetchRes.status).toBe(404); // Should return 404 Not Found
  });

  // Test 5: Handle Missing Conversation
  test('should return 404 for a non-existent conversation', async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/conversations/${nonExistentId.toString()}`);
    expect(res.status).toBe(404); // Check for Not Found status
    expect(res.body).toHaveProperty('error', 'Conversation not found'); // Error message should be present
  });
});
