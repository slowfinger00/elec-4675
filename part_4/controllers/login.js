const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user');

const loginRouter = express.Router();

loginRouter.post('/', async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  const passwordValid = user ? await bcrypt.compare(password, user.passwordHash) : false;

  if (!user || !passwordValid) {
    return res.status(401).json({
      error: 'incorrect username or password'
    });
  }

  const userForToken = {
    username: user.username,
    id: user._id,
  };

  const token = jwt.sign(userForToken, process.env.SECRET);

  res.status(200).send({ token, username: user.username, name: user.name });
});

module.exports = loginRouter;