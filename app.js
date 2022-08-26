const express = require("express");
const app = express();
const dot = require("dotenv").config();

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(PORT, "서버 열림");
});
