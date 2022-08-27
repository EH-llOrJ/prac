const express = require("express");
const dot = require("dotenv").config();
const jwt = require("jsonwebtoken");
const session = require("express-session");
const mysql = require("mysql2");
const ejs = require("ejs");
const bcrypt = require("bcrypt");
const app = express();
const PORT = process.env.PORT;

app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: true,
  })
);
app.set("view engine", "ejs");
app.set("views", "./views");

const client = mysql.createConnection({
  user: "root",
  password: process.env.CLIENT_PW,
  database: "test1",
  multipleStatements: true,
});

app.get("/", (req, res) => {
  res.render("login");
});

app.get("/join", (req, res) => {
  res.render("join");
});

app.post("/join", (req, res) => {
  const { user_id, user_pw } = req.body;
  const sql = "insert into users (user_id, user_pw) values(?,?)";
  console.log(req.body);
  client.query(sql, [user_id, user_pw], () => {
    res.redirect("/");
  });
});

app.post("/login", (req, res) => {
  const { user_id, user_pw } = req.body;
  const sql = "select * from users where user_id=?";
  client.query(sql, [user_id], (err, result) => {
    if (err) {
      res.send("계정 없음");
    } else {
      if (result[0] && user_pw === result[0]?.user_pw) {
        // 로그인 성공했으니까 토큰 발급 부분
        const accessToken = jwt.sign(
          {
            user_id: result[0].user_id,
            mail: "jth4115@naver.com",
            name: "th",
          },
          process.env.ACCESS_TOKEN,
          {
            expiresIn: "5s",
          }
        );
        const refreshToken = jwt.sign(
          {
            user_id: result[0].user_id,
          },
          process.env.REFRESH_TOKEN,
          {
            expiresIn: "1m",
          }
        );
        const sql = "update users set refresh=? where user_id=?";
        client.query(sql, [refreshToken, user_id]);
        req.session.access_token = accessToken;
        req.session.refresh_token = refreshToken;
        res.send({ access: accessToken, refresh: refreshToken });
      } else {
        res.send("계정 없음");
      }
    }
  });
});

const middleware = (req, res, next) => {
  const { access_token, refresh_token } = req.session;
  jwt.verify(access_token, process.env.ACCESS_TOKEN, (err, acc_decoded) => {
    if (err) {
      jwt.verify(
        refresh_token,
        process.env.REFRESH_TOKEN,
        (err, ref_decoded) => {
          if (err) {
            res.send("다시 로그인 해주세요");
          } else {
            const sql = "select * from users where user_id=?";
            client.query(sql, [ref_decoded.user_id], (err, result) => {
              if (err) {
                res.send("데이터베이스 연결을 확인해주세요");
              } else {
                if (result[0]?.refresh == refresh_token) {
                  const accessToken = jwt.sign(
                    {
                      user_id: ref_decoded.user_id,
                    },
                    process.env.ACCESS_TOKEN,
                    {
                      expiresIn: "5s",
                    }
                  );
                  req.session.access_token = accessToken;
                  next();
                } else {
                  res.send("다시 로그인 해주세요");
                }
              }
            });
          }
        }
      );
    } else {
      next();
    }
  });
};

app.get("/check", middleware, (req, res) => {
  res.send("로그인 되어있음");
});

app.listen(PORT, () => {
  console.log(PORT, "서버 열림");
});
