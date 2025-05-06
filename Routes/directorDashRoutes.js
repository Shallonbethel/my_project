// Routes/dashboardRoutes.js

const express = require("express");
const router = express.Router();
const { ensureLoggedIn, ensureDirector } = require('../middlewares/roleCheck');
const Procurement = require('../models/Procurement');
const Sale = require('../Models/sale');
const CreditSale = require('../Models/CreditSale');

// Dashboard route (must be authenticated and director)
router.get("/dashboard", ensureLoggedIn, ensureDirector, async (req, res) => {
  try {
    // Aggregate procurement
    const procureAgg = await Procurement.aggregate([
      { $group: { _id: null, totalcost: { $sum: "$cost" }, stock: { $sum: "$tonnage" } } }
    ]);
    // Aggregate sales
    const salesAgg = await Sale.aggregate([
      { $group: { _id: null, totalpayment: { $sum: "$amountPaid" }, tonnage: { $sum: "$tonnage" } } }
    ]);
    // Aggregate credit sales
    const creditAgg = await CreditSale.aggregate([
      { $group: { _id: null, amountDue: { $sum: "$amountDue" }, tonnage: { $sum: "$tonnage" } } }
    ]);

    res.render("directorDashboard", {
      procure: procureAgg[0] || { totalcost: 0, stock: 0 },
      sales: salesAgg[0] || { totalpayment: 0, tonnage: 0 },
      credit: creditAgg[0] || { amountDue: 0, tonnage: 0 }
    });
  } catch (error) {
    res.status(500).render("error", { message: error.message });
  }
});

module.exports = router;