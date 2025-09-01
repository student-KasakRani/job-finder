const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

// Models
const User = require('../Models/User');

// ======= SIGNUP =======
router.get('/signup', (req, res) => {
  res.render('auth/signup');
});

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.send('User already exists. Please login.');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({ name, email, password: hashedPassword, role });

    // Set session
    req.session.user = { _id: user._id, name: user.name, email: user.email, role: user.role };

    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.send('Error in signup');
  }
});

// ======= LOGIN =======
router.get('/login', (req, res) => {
  res.render('auth/login');
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) return res.send('Invalid Credentials');

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.send('Invalid Credentials');

    // Set session
    req.session.user = { _id: user._id, name: user.name, email: user.email, role: user.role };

    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.send('Error in login');
  }
});

// ======= LOGOUT =======
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;
