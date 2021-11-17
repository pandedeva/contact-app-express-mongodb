const mongoose = require("mongoose");

// membuat Schema
const Contact = mongoose.model("Contact", {
  nama: {
    type: String,
    required: true,
  },
  noHp: {
    type: String,
    required: true,
  },
  email: {
    type: String,
  },
});

module.exports = Contact;
