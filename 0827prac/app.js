const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;

const dot = require("dotenv");
const ejs = require("ejs");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");

app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.set("views", "./views");

// let connection = mysql.createConnection({
//   user: "root",
//   password: process.env.DB_PW,
//   database: "test3",
// });

app.listen(PORT, () => {
  console.log(PORT, "서버 열림");
});
