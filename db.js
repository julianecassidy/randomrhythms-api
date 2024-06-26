"use strict";

/** Database setup for RandomRythms API. */

const { Client } = require("pg");
const { DB_URI } = require("./config");

const db = new Client(DB_URI);

console.log("Connecting to database:", DB_URI);

db.connect();

module.exports = db;