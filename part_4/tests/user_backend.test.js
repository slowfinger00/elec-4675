const supertest = require('supertest');
const mongoClient = require('mongoose');
const app = require('../app');
const User = require('../models/user');
const { test, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const api = supertest(app);

beforeEach(async () => {
  await User.deleteMany({});
});

test('a new user can be added', async () => {
  const newUser = {
    username: 'newuser',
    name: 'New User',
    password: 'newpassword123'
  };

  await api.post('/api/users')
           .send(newUser)
           .expect(201)
           .expect('Content-Type', /application\/json/);

  const usersAtEnd = await User.find({});
  assert.strictEqual(usersAtEnd.length, 1, 'should have one user in the database');
  assert.strictEqual(usersAtEnd[0].username, newUser.username, 'username should match the added user');
});

test('creating a user with an existing username fails', async () => {
  const newUser = {
    username: 'newuser',
    name: 'New User',
    password: 'newpassword123'
  };

  await api.post('/api/users')
           .send(newUser)
           .expect(201)
           .expect('Content-Type', /application\/json/);

  const result = await api.post('/api/users')
                          .send(newUser)
                          .expect(400);

  assert(result.body.error, 'username must be unique', 'should return unique username error');

  const usersAtEnd = await User.find({});
  assert.strictEqual(usersAtEnd.length, 1, 'should still have one user in the database');
});

test('password shorter than 3 characters returns error', async () => {
  const newUser = {
    username: 'anotheruser',
    name: 'Another User',
    password: 'pw'
  };

  const result = await api.post('/api/users')
                          .send(newUser)
                          .expect(400);

  assert(result.body.error, 'password must be at least 3 characters long', 'should return password length error');

  const usersAtEnd = await User.find({});
  assert.strictEqual(usersAtEnd.length, 0, 'should not add user with short password');
});

test('username shorter than 3 characters returns error', async () => {
  const newUser = {
    username: 'us',
    name: 'Short Username',
    password: 'validpassword'
  };

  const result = await api.post('/api/users')
                          .send(newUser)
                          .expect(400);

  assert(result.body.error, 'username must be at least 3 characters long', 'should return username length error');

  const usersAtEnd = await User.find({});
  assert.strictEqual(usersAtEnd.length, 0, 'should not add user with short username');
});

after(async () => {
  await User.deleteMany({});
  await mongoClient.connection.close();
});