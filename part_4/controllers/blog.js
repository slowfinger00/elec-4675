const express = require('express');
const Blog = require('../models/blog');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

const blogRouter = express.Router();

const getTokenFrom = request => {
  const authorization = request.get('authorization');
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.replace('Bearer ', '');
  }
  return null;
};

blogRouter.get('/', async (_, res) => {
  const blogs = await Blog.find({}).populate('user');
  res.json(blogs);
});

blogRouter.post('/', async (req, res) => {
  const { title, author, url, likes } = req.body;

  const token = getTokenFrom(req);
  if (!token) {
    return res.status(401).json({ error: 'missing token' });
  }

  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.SECRET);
  } catch (error) {
    return res.status(401).json({ error: 'incorrect token' });
  }

  const user = await User.findById(decodedToken.id);
  if (!user) {
    return res.status(401).json({ error: 'not allowed' });
  }

  if (!title || !url) {
    return res.status(400).json({ error: 'title or url is missing' });
  }

  const blog = new Blog({
    title,
    author,
    url,
    likes: likes || 0,
    user: user._id,
  });

  const savedBlog = await blog.save();
  user.blogs = user.blogs.concat(savedBlog._id);
  await user.save();
  const populatedBlog = await savedBlog.populate('user');

  res.status(201).json(populatedBlog);
});

blogRouter.delete('/:id', async (req, res) => {
  const { id } = req.params;

  const blog = await Blog.findById(id);
  if (!blog) {
    return res.status(404).json({ error: 'missing blog' });
  }

  const token = getTokenFrom(req);
  if (!token) {
    return res.status(401).json({ error: 'missing token' });
  }

  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.SECRET);
  } catch (error) {
    return res.status(401).json({ error: 'incorrect token' });
  }

  const user = await User.findById(decodedToken.id);
  if (!user || blog.user.toString() !== user.id.toString()) {
    return res.status(401).json({ error: 'not allowed' });
  }

  try {
    await Blog.findByIdAndRemove(id);
    res.status(204).end();
  } catch (error) {
    res.status(400).json({ error: 'blog deletion failed' });
  }
});

blogRouter.put('/:id', async (req, res) => {
  const { likes } = req.body;

  try {
    const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, { likes }, { new: true });
    if (updatedBlog) {
      res.json(updatedBlog);
    } else {
      res.status(404).end();
    }
  } catch (error) {
    res.status(400).json({ error: 'blog update failed' });
  }
});

module.exports = blogRouter;
