const express = require('express');
const router = express.Router();
const Procurement = require('../models/Procurement');
const { ensureManagerOrAgent } = require('../middlewares/roleCheck');

// GET: Render procurement form
router.get('/procure', ensureManagerOrAgent, (req, res) => {
  res.render('procurement.pug', { 
    user: req.user,
    title: 'Add Procurement',
    error: req.flash('error'),
    success: req.flash('success')
  });
});

// GET: Procurement List
router.get('/procurementList', async (req, res) => {
  try {
    const procurements = await Procurement.find();
    res.render('procurementList', { procurements, user: req.session.user });
  } catch (err) {
    console.error(err);
    res.render('procurementList', { error: 'Failed to load procurements' });
  }
});


// GET: Get single procurement
router.get('/procurement/:id', async (req, res) => {
  try {
    const procurement = await Procurement.findById(req.params.id);
    if (!procurement) {
      return res.status(404).json({ error: 'Procurement record not found' });
    }
    res.json(procurement);
  } catch (err) {
    console.error('Error fetching procurement:', err);
    res.status(500).json({ message: 'Failed to fetch procurement record', error: err, user: req.user });
  }
});

// PUT: Update procurement
router.put('/procurement/:id', ensureManagerOrAgent, async (req, res) => {
  try {
    const {
      produceName,
      produceType,
      date,
      time,
      tonnage,
      cost,
      dealerName,
      branch,
      contact,
      sellingPrice
    } = req.body;

    if (!produceName || !produceType || !date || !time || !tonnage || !cost || !dealerName || !branch || !contact || !sellingPrice) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const procurement = await Procurement.findById(req.params.id);
    if (!procurement) {
      return res.status(404).json({ error: 'Procurement record not found' });
    }

    // Update procurement
    procurement.produceName = produceName;
    procurement.produceType = produceType;
    procurement.date = new Date(date);
    procurement.time = time;
    procurement.tonnage = Number(tonnage);
    procurement.cost = Number(cost);
    procurement.dealerName = dealerName;
    procurement.branch = branch;
    procurement.contact = contact;
    procurement.sellingPrice = Number(sellingPrice);

    await procurement.save();
    res.json({ message: 'Procurement record updated successfully' });
  } catch (err) {
    console.error('Error updating procurement:', err);
    res.status(500).json({ error: 'Failed to update procurement record' });
  }
});

// DELETE: Delete procurement
router.delete('/procurement/:id', ensureManagerOrAgent, async (req, res) => {
  try {
    const procurement = await Procurement.findById(req.params.id);
    if (!procurement) {
      return res.status(404).json({ error: 'Procurement record not found' });
    }

    await Procurement.findByIdAndDelete(req.params.id);
    res.json({ message: 'Procurement record deleted successfully' });
  } catch (err) {
    console.error('Error deleting procurement:', err);
    res.status(500).json({ error: 'Failed to delete procurement record' });
  }
});

// POST: Handle procurement submission
router.post('/procure', ensureManagerOrAgent, async (req, res) => {
  try {
    const {
      produceName,
      produceType,
      date,
      time,
      tonnage,
      cost,
      dealerName,
      branch,
      contact,
      sellingPrice
    } = req.body;

    if (!produceName || !produceType || !date || !time || !tonnage || !cost || !dealerName || !branch || !contact || !sellingPrice) {
      req.flash('error', 'All fields are required.');
      return res.redirect('/procure');
    }

    const newProcurement = new Procurement({
      produceName,
      produceType,
      date: new Date(date),
      time,
      tonnage: Number(tonnage),
      cost: Number(cost),
      dealerName,
      branch,
      contact,
      sellingPrice: Number(sellingPrice),
      createdBy: req.user ? req.user._id : undefined
    });

    await newProcurement.save();
    req.flash('success', 'Procurement recorded successfully!');
    res.redirect('/procurementList');

  } catch (err) {
    console.error('Error saving procurement:', err);
    req.flash('error', 'Error saving procurement. Please try again.');
    res.redirect('/procure');
  }
});

module.exports = router;
