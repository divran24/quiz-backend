const express = require("express");
const quizzesRouter = require("./routes/quizzes");
const bodyParser = require("express").json;
const app = express();
app.use(bodyParser());
app.use("/quizzes", quizzesRouter);

// error handler
app.use((err, req, res, next) => {
  if (err.isJoi) return res.status(400).json({ error: err.details[0].message });
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});

module.exports = app;
