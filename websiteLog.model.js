const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  error:{
    type: String,
    required: true
  }
});

module.exports = mongoose.model(
  "websiteLog",
  logSchema
);
