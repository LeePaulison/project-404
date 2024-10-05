const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../server/index"); // Import the raw Express app
const { connect, disconnect, clearDatabase } = require("../server/tests/setup"); // Import test setup
const User = require("../server/models/User");
const Conversation = require("../server/models/Conversation");

describe("Merge User API Tests", () => {
  // Set up the database before running tests
  beforeAll(async () => {
    await connect();
  });

  // Clear the database between tests
  beforeEach(async () => {
    await clearDatabase();
  });

  // Disconnect and clean up after all tests are complete
  afterAll(async () => {
    await disconnect();
  });

  test("should merge an anonymous user into a Google user successfully", async () => {
    // Step 1: Create an Anonymous User
    const anonymousUser = new User({
      firebaseUIDs: ["test-anonymous-uid"],
    });
    await anonymousUser.save();

    // Step 2: Create a Google User
    const googleUser = new User({
      firebaseUIDs: ["google-uid-123"],
      email: "testuser@example.com",
    });
    await googleUser.save();

    // Step 3: Create a Conversation for the Anonymous User
    const conversation = new Conversation({
      userId: anonymousUser._id,
      conversationTitle: "Anonymous Test Conversation",
      messages: [{ role: "user", content: "Hello, this is a test conversation!" }],
    });
    await conversation.save();

    // Step 4: Merge the Anonymous User into the Google User
    const res = await request(app).post("/api/users/merge").send({
      currentFirebaseUID: "test-anonymous-uid",
      googleEmail: "testuser@example.com",
    });

    expect(res.status).toBe(200); // Check for OK status
    expect(res.body).toHaveProperty("message", "User UIDs merged and conversations transferred successfully");

    // Verify that the conversation has been transferred to the Google User
    const updatedConversation = await Conversation.findById(conversation._id);
    expect(updatedConversation.userId.toString()).toBe(googleUser._id.toString());
  });
});
