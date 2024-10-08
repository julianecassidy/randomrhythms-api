const express = require("express");

const { NotFoundError } = require("./helpers/expressError");

const { authenticateJWT, limiter } = require("./middleware/middleware");

const cors = require('cors');
const app = express();

// app.use(cors());
app.use(express.json());                           // process JSON data
app.use(express.urlencoded());
app.use(cors());                     // process trad form data

// app.use(authenticateJWT);

const authRoutes = require('./routes/auth');
const concertRoutes = require('./routes/concerts');

app.use("/auth", authRoutes);
app.use("/concerts", concertRoutes);

app.use('/concerts', limiter)

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