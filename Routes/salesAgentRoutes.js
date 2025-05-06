const express = require('express');
const router = express.Router();
const Sale = require('../Models/sale');
const CreditSale = require('../Models/CreditSale');
const ensureLogin = require('connect-ensure-login');

// === Middleware to check if user is a Sales Agent ===
function ensureSalesAgent(req, res, next) {
  console.log('Auth check - User:', req.user);
  console.log('Auth check - Is authenticated:', req.isAuthenticated());
  console.log('Auth check - User role:', req.user?.role);
  
  if (req.isAuthenticated() && req.user.role === 'salesAgent') {
    console.log('Auth check - Passed');
    return next();
  }
  console.log('Auth check - Failed');
  return res.status(403).render('error', {
    title: 'Error',
    message: 'Not authorized.',
  });
}

// === GET Sales Agent Dashboard ===
router.get('/salesAgentDashboard',
  ensureLogin.ensureLoggedIn(),
  ensureSalesAgent,
  async (req, res) => {
    try {
      console.log('Dashboard - User:', req.user);
      console.log('Dashboard - Branch:', req.user.branch);
      
      const branch = req.user.branch;

      // Aggregate regular sales for the branch
      console.log('Attempting to aggregate sales for branch:', branch);
      const salesAgg = await Sale.aggregate([
        { $match: { branchName: branch } },
        {
          $group: {
            _id: null,
            totalpayment: { $sum: "$amountPaid" },
            tonnage: { $sum: "$tonnage" }
          }
        }
      ]);
      console.log('Sales aggregation result:', salesAgg);

      // Aggregate credit sales for the branch
      console.log('Attempting to aggregate credit sales for branch:', branch);
      const creditAgg = await CreditSale.aggregate([
        { $match: { branchName: branch } },
        {
          $group: {
            _id: null,
            amountDue: { $sum: "$amountDue" },
            tonnage: { $sum: "$tonnage" }
          }
        }
      ]);
      console.log('Credit sales aggregation result:', creditAgg);

      // Find all sales for this branch
      console.log('Attempting to find sales for branch:', branch);
      const salesList = await Sale.find({ branchName: branch }).lean();
      console.log('Sales list found:', salesList.length, 'items');

      // Render dashboard
      res.render('salesAgentDashboard', {
        sales: salesAgg[0] || { totalpayment: 0, tonnage: 0 },
        credit: creditAgg[0] || { amountDue: 0, tonnage: 0 },
        salesList,
        user: req.user
      });

    } catch (err) {
      console.error('Failed to load sales agent dashboard. Full error:', err);
      console.error('Error stack:', err.stack);
      res.status(500).render('error', { 
        title: 'Error',
        message: 'Failed to load dashboard',
        error: err
      });
    }
  }
);

module.exports = router;
