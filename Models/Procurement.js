const mongoose = require('mongoose');

const procurementSchema = new mongoose.Schema({
  produceName: String,
  produceType: String,
  date: Date,
  time: String,
  tonnage: Number,
  cost: Number,
  dealerName: String,
  branchName: String,
  contact: String,
  sellingPrice: Number
});

module.exports = mongoose.model('Procurement', procurementSchema);
