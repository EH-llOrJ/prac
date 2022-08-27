// .env 모듈 가져오면서 사용하기
const dot = require("dotenv").config();
const ejs = require("ejs");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");

const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.set("views", "./views");

let connection = mysql.createConnection({
  user: "root",
  password: process.env.DB_PW,
  database: "test3",
});

app.get("/", (req, res) => {
  res.render("main");
});

app.post("/signup", (req, res) => {
  let hashpw = bcrypt.hashSync(req.body.pw, 10);
  const sql = `insert into members (id,pw) values ('${req.body.id}', '${hashpw}');`;
  connection.query(sql, (err, result) => {
    if (err) {
      console.log("sql 에러", err);
    } else {
      res.send("suc");
    }
  });
});

app.post("/login", (req, res) => {
  connection.query(
    `select * from members where id = '${req.body.id}'`,
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        if (result[0] == undefined) {
          res.send("fail");
        } else {
          let decodepw = bcrypt.compareSync(req.body.pw, result[0].pw);
          if (decodepw) {
            res.send("suc");
          } else {
            res.send("fail");
          }
        }
      }
    }
  );
});

app.listen(PORT, () => {
  console.log(PORT, "서버 열림");
});
