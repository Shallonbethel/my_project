const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  produceName: { type: String, required: true },
  tonnage: { type: Number, required: true },
  amountPaid: { type: Number, required: true },
  buyerName: { type: String, required: true },
  salesAgentName: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Sale', saleSchema);
