const express = require("express");
const app = express();

const { NotFoundError } = require("./expressError");

app.use(express.json());                           // process JSON data
app.use(express.urlencoded());                     // process trad form data

const concertRoutes = require('./routes/concerts');

app.use("/concerts", concertRoutes)

app.use(function (req, res) {                      // handle site-wide 404s
  throw new NotFoundError();
});

app.use(function (err, req, res, next) {           // global err handler
  const status = err.status || 500;
  const message = err.message;
  if (process.env.NODE_ENV !== "test") console.error(status, err.stack);
  return res.status(status).json({ error: { message, status } });
});

module.exports = app;                              // don't forget this!