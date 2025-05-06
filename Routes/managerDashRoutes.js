const express = require('express');
const router = express.Router();
const Sale = require('../Models/sale');
const Procurement = require('../models/Procurement');
const CreditSale = require('../Models/CreditSale');
const { ensureLoggedIn, ensureManagerOrDirector } = require('../middlewares/roleCheck');

// GET Manager Dashboard
router.get('/manager-dashboard', ensureLoggedIn, ensureManagerOrDirector, async (req, res) => {
  try {
    const branch = req.user.branch;
    // Aggregate procurement for this branch
    const procureAgg = await Procurement.aggregate([
      { $match: { branchName: branch } },
      { $group: { _id: null, totalcost: { $sum: "$cost" }, stock: { $sum: "$tonnage" } } }
    ]);
    // Aggregate sales for this branch
    const salesAgg = await Sale.aggregate([
      { $match: { branchName: branch } },
      { $group: { _id: null, totalpayment: { $sum: "$amountPaid" }, tonnage: { $sum: "$tonnage" } } }
    ]);
    // Aggregate credit sales for this branch
    const creditAgg = await CreditSale.aggregate([
      { $match: { branchName: branch } },
      { $group: { _id: null, amountDue: { $sum: "$amountDue" }, tonnage: { $sum: "$tonnage" } } }
    ]);

    res.render('managerDash', {
      procure: procureAgg[0] || { totalcost: 0, stock: 0 },
      sales: salesAgg[0] || { totalpayment: 0, tonnage: 0 },
      credit: creditAgg[0] || { amountDue: 0, tonnage: 0 },
      salesList: await Sale.find({ branchName: branch }).lean()
    });
  } catch (err) {
    console.error('Failed to load dashboard:', err);
    res.status(500).send('Server error');
  }
});

// Example: API endpoint to get sales as JSON (optional)
router.get('/api/manager/sales', async (req, res) => {
  try {
    const salesList = await Sale.find().lean();
    res.json(salesList);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch sales' });
  }
});

module.exports = router;
