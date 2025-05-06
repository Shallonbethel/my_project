const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { ensureManagerOrDirector } = require('../middlewares/roleCheck');

// GET: Render signup form
router.get('/signup', ensureManagerOrDirector, (req, res) => {
  res.render('signup', { 
    user: req.user,
    title: 'Add User',
    error: req.flash('error'),
    success: req.flash('success')
  });
});

// GET: User List
router.get('/signupList', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.render('signupList', { 
      users,
      user: req.user,
      error: req.flash('error'),
      success: req.flash('success')
    });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).render('error', { message: 'Failed to load user list', error: err, user: req.user });
  }
});

// GET: Get single user
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// PUT: Update user
router.put('/users/:id', ensureManagerOrDirector, async (req, res) => {
  try {
    const { fname, email, role, branch, password } = req.body;

    if (!fname || !email || !role || !branch) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user
    user.fname = fname;
    user.email = email;
    user.role = role;
    user.branch = branch;

    // Update password if provided
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    await user.save();
    res.json({ message: 'User updated successfully' });
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// DELETE: Delete user
router.delete('/users/:id', ensureManagerOrDirector, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent deleting the last director
    if (user.role === 'director') {
      const directorCount = await User.countDocuments({ role: 'director' });
      if (directorCount <= 1) {
        return res.status(400).json({ error: 'Cannot delete the last director' });
      }
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// POST: Handle signup submission
router.post('/signup', ensureManagerOrDirector, async (req, res) => {
  try {
    const { fname, email, password, role, branch } = req.body;

    if (!fname || !email || !password || !role || !branch) {
      req.flash('error', 'All fields are required.');
      return res.redirect('/signup');
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.flash('error', 'Email already registered.');
      return res.redirect('/signup');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      fname,
      email,
      password: hashedPassword,
      role,
      branch
    });

    await newUser.save();
    req.flash('success', 'User registered successfully!');
    res.redirect('/signupList');

  } catch (err) {
    console.error('Error saving user:', err);
    req.flash('error', 'Error saving user. Please try again.');
    res.redirect('/signup');
  }
});

module.exports = router; 