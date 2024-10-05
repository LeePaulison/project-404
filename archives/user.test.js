const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index'); // Import the raw Express app
const { connect, disconnect, clearDatabase } = require('./setup'); // Import test setup
const User = require('../models/User');

describe('User API Tests', () => {
  // Set up the database before running tests
  beforeAll(async () => {
    await connect();
  });

  // Clear the database between tests
  beforeEach(async () => {
    await clearDatabase();
  });

  // Disconnect after all tests are done
  afterAll(async () => {
    await disconnect();
  });

  // Test User Creation
  test('should create a new user with a firebaseUID', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({
        firebaseUIDs: ['test-firebase-uid']
      });

    expect(res.status).toBe(201); // Check for Created status
    expect(res.body).toHaveProperty('_id'); // The response should have an `_id` property
    expect(res.body.firebaseUIDs).toContain('test-firebase-uid'); // The UID should be in the firebaseUIDs array
  });

  // Test Fetching a User by ID
  test('should fetch a user by ID', async () => {
    // Manually create a user in the database
    const user = new User({
      firebaseUIDs: ['test-fetch-uid'],
      email: 'fetchuser@example.com'
    });
    await user.save();

    // Fetch the user using its ID
    const res = await request(app).get(`/api/users/${user._id}`);
    expect(res.status).toBe(200); // OK status
    expect(res.body).toHaveProperty('email', 'fetchuser@example.com'); // Verify email matches
    expect(res.body.firebaseUIDs).toContain('test-fetch-uid'); // UID should match
  });

  // Test Updating a User
  test('should update a user by ID', async () => {
    // Create a user to be updated
    const user = new User({
      firebaseUIDs: ['test-update-uid'],
      email: 'updateuser@example.com'
    });
    await user.save();

    // Update the user's email and add a new UID
    const res = await request(app)
      .put(`/api/users/${user._id}`)
      .send({ email: 'updateduser@example.com', firebaseUIDs: ['new-uid'] });

    expect(res.status).toBe(200); // OK status
    expect(res.body).toHaveProperty('email', 'updateduser@example.com'); // Verify updated email
    expect(res.body.firebaseUIDs).toContain('new-uid'); // New UID should be present
  });

  // Test Deleting a User
  test('should delete a user by ID', async () => {
    // Create a user to be deleted
    const user = new User({
      firebaseUIDs: ['test-delete-uid'],
      email: 'deleteuser@example.com'
    });
    await user.save();

    // Delete the user by its ID
    const res = await request(app).delete(`/api/users/${user._id}`);
    expect(res.status).toBe(200); // OK status
    expect(res.body).toHaveProperty('message', 'User deleted successfully'); // Check success message

    // Attempt to fetch the deleted user
    const fetchRes = await request(app).get(`/api/users/${user._id}`);
    expect(fetchRes.status).toBe(404); // Should return 404 Not Found
  });

  // Test Duplicate firebaseUID
  test('should not create a user with a duplicate firebaseUID', async () => {
    console.log('Mongoose connection state in test:', mongoose.connection.readyState);

    // Create an initial user
    const user = new User({
      firebaseUIDs: ['duplicate-uid'],
      email: 'user@example.com'
    });
    await user.save();

    // Log the state before making the request
    console.log('User saved, Mongoose connection state:', mongoose.connection.readyState);

    // Attempt to create another user with the same firebaseUID
    const res = await request(app)
      .post('/api/users')
      .send({
        firebaseUIDs: ['duplicate-uid'],
        email: 'newuser@example.com'
      });

    console.log('Response:', res.body);
    expect(res.status).toBe(400); // Expect a 400 Bad Request response
    expect(res.body).toHaveProperty('error'); // Error should be present
    expect(res.body.error).toContain('A user with one of the provided firebaseUIDs already exists');
  });
});