const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

// Import your CreditSale model (adjust path as needed)
const CreditSale = require("../Models/CreditSale");

// GET route to render the form
router.get("/add", (req, res) => {
  res.render("creditSaleForm", { user: req.user });
});

// GET: Credit Sales List Page
router.get('/creditSaleList', async (req, res) => {
  try {
    const creditSales = await CreditSale.find().sort({ dueDate: -1 });
    res.render('creditSaleList', { creditSales, user: req.user });
  } catch (err) {
    res.status(500).render('error', { message: 'Failed to load credit sales list', error: err, user: req.user });
  }
});

// POST route to handle form submission
router.post("/add", async (req, res) => {
  try {
    const {
      customerName,
      product,
      quantity,
      pricePerUnit,
      totalAmount,
      dueDate,
    } = req.body;

    // Validate input (basic server-side check)
    if (
      !customerName ||
      !product ||
      !quantity ||
      !pricePerUnit ||
      !totalAmount ||
      !dueDate
    ) {
      return res.status(400).send("All fields are required.");
    }

    // Create new credit sale record
    const newSale = new CreditSale({
      customerName,
      product,
      quantity: Number(quantity),
      pricePerUnit: Number(pricePerUnit),
      totalAmount: Number(totalAmount),
      dueDate: new Date(dueDate),
      createdAt: new Date(),
    });

    await newSale.save();
    res.redirect("/creditSaleList"); // Redirect to the list page
  } catch (error) {
    console.error("Error saving credit sale:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
