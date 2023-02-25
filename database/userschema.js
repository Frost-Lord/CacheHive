const mongoose = require("mongoose");

const DataSchema = new mongoose.Schema({
  id: { type: String, default: null },
  name: { type: String, default: null },
  lastname: { type: String, default: null },
  house: { type: String, default: null },
  street: { type: String, default: null },
  registeredAt: { type: Number, default: Date.now() },
});

module.exports = mongoose.model("Data", DataSchema);
