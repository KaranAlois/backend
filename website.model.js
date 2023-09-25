const mongoose = require("mongoose");

const websites = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
  status: {
    type: String,
  },
});

module.exports = mongoose.model("websitesArray", websites);
