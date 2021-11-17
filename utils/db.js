const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/deva");

// // menambah 1 data
// const contact1 = new Contact({
//   nama: "Doody",
//   noHp: "08132121323",
//   email: "doddy@gmail.com",
// });

// // simpan ke collections
// contact1.save().then((contact) => console.log(contact));
