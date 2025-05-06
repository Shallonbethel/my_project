const express = require('express');
const router = express.Router();
const Sale = require('../Models/sale');
const Procurement = require('../models/Procurement');
const { ensureManagerOrAgent } = require('../middlewares/roleCheck');

// GET: Render sales form
router.get('/', ensureManagerOrAgent, (req, res) => {
  console.log('GET /sell route hit. User:', req.user);
  res.render('sales', { 
    user: req.user || { fname: '' },
    title: 'Sales Form',
    error: req.flash('error'),
    success: req.flash('success')
  });
});

// GET: Sales List Page
router.get('/saleslist', async (req, res) => {
  try {
    let query = {};
    // If user is a sales agent, only show their sales
    if (req.user && req.user.role === 'salesAgent') {
      query.salesAgentName = req.user.fname;
    }
    const sales = await Sale.find(query).sort({ date: -1 });
    res.render('saleslist', { 
      sales, 
      user: req.user,
      error: req.flash('error'),
      success: req.flash('success')
    });
  } catch (err) {
    console.error('Error fetching sales:', err);
    res.status(500).render('error', { message: 'Failed to load sales list', error: err, user: req.user });
  }
});

// GET: Get single sale
router.get('/:id', async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) {
      return res.status(404).json({ error: 'Sale not found' });
    }
    res.json(sale);
  } catch (err) {
    console.error('Error fetching sale:', err);
    res.status(500).json({ error: 'Failed to fetch sale' });
  }
});

// PUT: Update sale
router.put('/:id', ensureManagerOrAgent, async (req, res) => {
  try {
    const {
      produceName,
      tonnage,
      amountPaid,
      buyerName,
      date,
      time,
    } = req.body;

    if (!produceName || !tonnage || !amountPaid || !buyerName || !date || !time) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const sale = await Sale.findById(req.params.id);
    if (!sale) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    // If tonnage changed, update stock
    if (sale.tonnage !== Number(tonnage)) {
      const stockItem = await Procurement.findOne({ produceName });
      if (!stockItem) {
        return res.status(400).json({ error: 'Produce not found in stock' });
      }

      // Calculate stock adjustment
      const tonnageDiff = Number(tonnage) - sale.tonnage;
      if (stockItem.tonnage + tonnageDiff < 0) {
        return res.status(400).json({ error: 'Not enough stock for this update' });
      }

      stockItem.tonnage += tonnageDiff;
      await stockItem.save();
    }

    // Update sale
    sale.produceName = produceName;
    sale.tonnage = Number(tonnage);
    sale.amountPaid = Number(amountPaid);
    sale.buyerName = buyerName;
    sale.date = new Date(date);
    sale.time = time;

    await sale.save();
    res.json({ message: 'Sale updated successfully' });
  } catch (err) {
    console.error('Error updating sale:', err);
    res.status(500).json({ error: 'Failed to update sale' });
  }
});

// DELETE: Delete sale
router.delete('/:id', ensureManagerOrAgent, async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    // Return tonnage to stock
    const stockItem = await Procurement.findOne({ produceName: sale.produceName });
    if (stockItem) {
      stockItem.tonnage += sale.tonnage;
      await stockItem.save();
    }

    await Sale.findByIdAndDelete(req.params.id);
    res.json({ message: 'Sale deleted successfully' });
  } catch (err) {
    console.error('Error deleting sale:', err);
    res.status(500).json({ error: 'Failed to delete sale' });
  }
});

// GET: Sales Agent Dashboard Data
router.get('/agent-dashboard', async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'salesAgent') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const sales = await Sale.find({ salesAgentName: req.user.fname });
    
    // Calculate totals
    const totalPayment = sales.reduce((sum, sale) => sum + (sale.amountPaid || 0), 0);
    const totalTonnage = sales.reduce((sum, sale) => sum + (sale.tonnage || 0), 0);
    
    // Get recent sales (last 5)
    const recentSales = sales.slice(0, 5);

    res.json({
      totalPayment,
      totalTonnage,
      recentSales
    });
  } catch (err) {
    console.error('Error fetching dashboard data:', err);
    res.status(500).json({ error: 'Failed to load dashboard data' });
  }
});

// POST: Handle sale submission
router.post('/', ensureManagerOrAgent, async (req, res) => {
  try {
    const {
      produceName,
      tonnage,
      amountPaid,
      buyerName,
      salesAgentName,
      date,
      time,
    } = req.body;

    if (!produceName || !tonnage || !amountPaid || !buyerName || !salesAgentName || !date || !time) {
      req.flash('error', 'All fields are required.');
      return res.redirect('/sell');
    }

    // Stock check and reduction
    const stockItem = await Procurement.findOne({ produceName });
    if (!stockItem || stockItem.tonnage < Number(tonnage)) {
      req.flash('error', 'Not enough stock for this sale.');
      return res.redirect('/sell');
    }
    // Reduce stock
    stockItem.tonnage -= Number(tonnage);
    await stockItem.save();

    const newSale = new Sale({
      produceName,
      tonnage: Number(tonnage),
      amountPaid: Number(amountPaid),
      buyerName,
      salesAgentName,
      date: new Date(date),
      time,
      createdBy: req.user ? req.user._id : undefined
    });

    await newSale.save();
    req.flash('success', 'Sale recorded successfully!');
    res.redirect('/sell/saleslist');

  } catch (err) {
    console.error('Error saving sale:', err);
    req.flash('error', 'Error saving sale. Please try again.');
    res.redirect('/sell');
  }
});

module.exports = router;
