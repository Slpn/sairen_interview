const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");

require("dotenv").config();

const app = express();

app.use(cors());
const jwtSecret = process.env.JWT_SECRET;

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const name = file.originalname.split(".")[0];
    const ext = path.extname(file.originalname);
    cb(null, name + "-" + Date.now() + ext);
  },
});

const upload = multer({ storage: storage });

app.post("/upload", authenticateToken, upload.single("file"), (req, res) => {
  if (req.file) {
    res.status(200).json({
      message: "Fichier téléchargé avec succès",
      fileName: req.file.filename,
    });
  } else {
    res.status(400).send("No file uploaded.");
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});

app.get("/token", (req, res) => {
  const user = {
    id: 1,
    username: "test",
  };
  const token = jwt.sign(user, jwtSecret);
  res.json({ token });
});
