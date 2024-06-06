const supertest = require('supertest');
const mongoClient = require('mongoose');
const app = require('../app');
const Blog = require('../models/blog');
const { test, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const api = supertest(app);

const initialBlogPosts = [
  {
    title: "tech trends 2024",
    author: "john doe",
    url: "https://techtrends.com",
    likes: 20
  },
  {
    title: "cooking basics",
    author: "jane smith",
    url: "https://cookingbasics.com",
    likes: 5
  }
];

beforeEach(async () => {
  await Blog.deleteMany({});
  await Blog.insertMany(initialBlogPosts);
});

test('blogs api returns correct number of blogs and in json format', async () => {
  const response = await api.get('/api/blogs')
                            .expect(200)
                            .expect('Content-Type', /application\/json/);

  const blogs = response.body;
  assert.strictEqual(blogs.length, initialBlogPosts.length, 'should return correct number of blogs');
});

test('blog entries have id field instead of _id', async () => {
  const response = await api.get('/api/blogs')
                            .expect(200)
                            .expect('Content-Type', /application\/json/);

  response.body.forEach(blog => {
    assert(blog.id, 'blog should have an id property');
    assert(!blog._id, 'blog should not have an _id property');
  });
});

test('a new blog can be added', async () => {
  const newBlogPost = {
    title: "gardening tips",
    author: "alice gardener",
    url: "https://gardeningtips.com",
    likes: 15
  };

  await api.post('/api/blogs')
           .send(newBlogPost)
           .expect(201)
           .expect('Content-Type', /application\/json/);

  const blogsAtEnd = await Blog.find({});
  assert.strictEqual(blogsAtEnd.length, initialBlogPosts.length + 1, 'should increase the total number of blogs by 1');

  const titles = blogsAtEnd.map(b => b.title);
  assert(titles.includes('gardening tips'), 'should contain the newly added blog title');
});

test('if likes property is missing, it defaults to 0', async () => {
  const newBlogPost = {
    title: "travel hacks",
    author: "traveler joe",
    url: "https://travelhacks.com"
  };

  const response = await api.post('/api/blogs')
                            .send(newBlogPost)
                            .expect(201)
                            .expect('Content-Type', /application\/json/);

  const blog = response.body;
  assert.strictEqual(blog.likes, 0, 'should default likes to 0 if missing');

  const savedBlog = await Blog.findById(blog.id);
  assert.strictEqual(savedBlog.likes, 0, 'saved blog should have likes set to 0');
});

test('a blog without a title results in a 400 bad request', async () => {
  const newBlogPost = {
    author: "unknown author",
    url: "http://example.com/new",
    likes: 3
  };

  await api.post('/api/blogs')
           .send(newBlogPost)
           .expect(400);

  const blogsAtEnd = await Blog.find({});
  assert.strictEqual(blogsAtEnd.length, initialBlogPosts.length, 'should not add the blog without a title');
});

test('a blog without a url results in a 400 bad request', async () => {
  const newBlogPost = {
    title: "new blog without url",
    author: "unknown author",
    likes: 3
  };

  await api.post('/api/blogs')
           .send(newBlogPost)
           .expect(400);

  const blogsAtEnd = await Blog.find({});
  assert.strictEqual(blogsAtEnd.length, initialBlogPosts.length, 'should not add the blog without a url');
});

test('a blog can be deleted successfully', async () => {
  const blogsAtStart = await Blog.find({});
  const blogToDelete = blogsAtStart[0];

  await api.delete(`/api/blogs/${blogToDelete.id}`)
           .expect(204);

  const blogsAtEnd = await Blog.find({});
  assert.strictEqual(blogsAtEnd.length, initialBlogPosts.length - 1, 'should decrease the total number of blogs by 1');

  const titles = blogsAtEnd.map(b => b.title);
  assert(!titles.includes(blogToDelete.title), 'should not contain the deleted blog title');
});

test('a blog can be updated successfully', async () => {
  const blogsAtStart = await Blog.find({});
  const blogToUpdate = blogsAtStart[0];

  const updatedBlogData = { likes: blogToUpdate.likes + 1 };

  const response = await api.put(`/api/blogs/${blogToUpdate.id}`)
                            .send(updatedBlogData)
                            .expect(200)
                            .expect('Content-Type', /application\/json/);

  const updatedBlog = response.body;
  assert.strictEqual(updatedBlog.likes, updatedBlogData.likes, 'should update the blog likes successfully');

  const blogsAtEnd = await Blog.find({});
  const updatedBlogFromDb = blogsAtEnd.find(b => b.id === blogToUpdate.id);
  assert.strictEqual(updatedBlogFromDb.likes, updatedBlogData.likes, 'should reflect the updated likes in the database');
});

after(async () => {
  await Blog.deleteMany({});
  await mongoClient.connection.close();
});
