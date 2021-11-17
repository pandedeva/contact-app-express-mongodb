const express = require("express");
const expressLayouts = require("express-ejs-layouts");

const { body, validationResult, check } = require("express-validator");
const methodOverride = require("method-override");

const session = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");

require("./utils/db");
const Contact = require("./model/contact");

const app = express();
const port = 3000;

// Setup Method-override
app.use(methodOverride("_method"));

// Setup EJS
app.set("view engine", "ejs");
app.use(expressLayouts);
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// konfigurasi flash
app.use(cookieParser("secret"));
app.use(
  session({
    cookie: { maxAge: 6000 },
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(flash());

// Halaman Home
app.get("/", (req, res) => {
  const mahasiswa = [
    {
      nama: "Pantek",
      email: "pantek@gmail.com",
    },
    {
      nama: "Deva",
      email: "deva@gmail.com",
    },
    {
      nama: "Pande",
      email: "pande@gmail.com",
    },
  ];
  // menjalankan file index.html
  res.render("index", {
    // mengirimkan data nama ke index.html
    nama: "Deva",
    title: "Halaman Home",
    mahasiswa,
    layout: "layouts/main-layout",
  });
});

// halaman about
app.get("/about", (req, res) => {
  res.render("about", {
    title: "Halaman About",
    layout: "layouts/main-layout",
  });
});

// halaman contact
app.get("/contact", async (req, res) => {
  const contacts = await Contact.find();

  res.render("contact", {
    title: "Halaman Contact",
    layout: "layouts/main-layout",
    contacts,
    msg: req.flash("msg"),
  });
});

// halaman form tambah data contact
app.get("/contact/add", (req, res) => {
  res.render("add-contact", {
    title: "Form Tambah Data Contact",
    layout: "layouts/main-layout",
  });
});

// proses tambah data contact
app.post(
  "/contact",
  [
    body("nama").custom(async (value) => {
      const duplikat = await Contact.findOne({ nama: value });
      if (duplikat) {
        throw new Error("Nama contact sudah digunakan!");
      }
      return true;
    }),
    body("noHp").custom(async (value) => {
      const duplikat = await Contact.findOne({ noHp: value });
      if (duplikat) {
        throw new Error("No HP sudah digunakan!");
      }
      return true;
    }),
    body("email").custom(async (value) => {
      const duplikat = await Contact.findOne({ email: value });
      if (duplikat) {
        throw new Error("Email sudah digunakan!");
      }
      return true;
    }),
    check("email", "Email tidak valid!").isEmail(), // mengecek email kalau email nya tidak valid
    check("noHp", "No HP tidak valid!").isMobilePhone("id-ID"), // mengecek noHp kalau nohp nya tidak valid
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("add-contact", {
        title: "Form Tambah Data Contact",
        layout: "layouts/main-layout",
        errors: errors.array(),
      });
    } else {
      Contact.insertMany(req.body, (error, result) => {
        // kirimkan flash message
        req.flash("msg", "Data Contact Berhasil Ditambahkan!");

        // riderect digunakan agar kembali ke halaman contact dan men load semua daftar contact
        res.redirect("/contact");
      });
    }
  }
);

// proses delete contact
// app.get("/contact/delete/:nama", async (req, res) => {
//   const contact = await Contact.findOne({ nama: req.params.nama });

//   // jika contact tidak ada
//   if (!contact) {
//     res.status(404);
//     res.send(`<h1>404 Not Found!</h1>`);
//   } else {
//     Contact.deleteOne({ _id: contact._id }).then((result) => {
//       req.flash("msg", "Data Contact Berhasil Dihapus!");
//       res.redirect("/contact");
//     });
//   }
// });

// proses delete contact new
app.delete("/contact", (req, res) => {
  Contact.deleteOne({ nama: req.body.nama }).then((result) => {
    req.flash("msg", "Data Contact Berhasil Dihapus!");
    res.redirect("/contact");
  });
});

// halaman form edit data contact
app.get("/contact/edit/:nama", async (req, res) => {
  const contact = await Contact.findOne({ nama: req.params.nama });

  res.render("edit-contact", {
    title: "Form Ubah Data Contact",
    layout: "layouts/main-layout",
    contact,
  });
});

// proses edit data
app.put(
  "/contact",
  [
    body("nama").custom(async (value, { req }) => {
      const duplikat = await Contact.findOne({ nama: value });
      if (value !== req.body.oldNama && duplikat) {
        throw new Error("Nama contact sudah digunakan!");
      }
      return true;
    }),
    body("email").custom(async (value, { req }) => {
      const duplikat = await Contact.findOne({ email: value });
      if (value !== req.body.oldEmail && duplikat) {
        throw new Error("Email sudah digunakan!");
      }
      return true;
    }),
    body("noHp").custom(async (value, { req }) => {
      const duplikat = await Contact.findOne({ noHp: value });
      if (value !== req.body.oldNoHp && duplikat) {
        throw new Error("Nomor HP sudah digunakan!");
      }
      return true;
    }),
    check("email", "Email tidak valid!").isEmail(), // mengecek email kalau email nya tidak valid
    check("noHp", "No HP tidak valid!").isMobilePhone("id-ID"), // mengecek noHp kalau nohp nya tidak valid
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("edit-contact", {
        title: "Form Ubah Data Contact",
        layout: "layouts/main-layout",
        errors: errors.array(),
        contact: req.body,
      });
    } else {
      Contact.updateOne(
        { _id: req.body._id },
        {
          $set: {
            nama: req.body.nama,
            email: req.body.email,
            noHp: req.body.noHp,
          },
        }
      ).then((result) => {
        // kirimkan flash message
        req.flash("msg", "Data Contact Berhasil Diubah!");
        // riderect digunakan agar kembali ke halaman contact dan men load semua daftar contact
        res.redirect("/contact");
      });
    }
  }
);

// halaman detail contact
app.get("/contact/:nama", async (req, res) => {
  const contact = await Contact.findOne({ nama: req.params.nama });
  // find contact menerima request params nama

  res.render("detail", {
    title: "Halaman Detail Contact",
    layout: "layouts/main-layout",
    contact,
  });
});

app.listen(port, () => {
  console.log(`Mongo Contact App | Listening at http://localhost:${port}`);
});
