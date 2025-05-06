const express = require('express');
const router = express.Router();

// GET: Manager Registration Page
router.get('/manager-reg', (req, res) => {
  res.render('manager-reg');
});

// GET: Procurement Page
router.get('/procurement', (req, res) => {
  res.render('procurement');
});

module.exports = router; 