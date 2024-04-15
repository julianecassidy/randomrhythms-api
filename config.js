"use strict";

/** Common config for RandomRhythms API */

// read .env files and make environmental variables

require("dotenv").config();

const DB_URI = (process.env.NODE_ENV === "test")
  ? "postgresql:///randomrhythms_test"
  : process.env.DATABASE_URL || "postgresql:///randomrhythms";

const SECRET_KEY = process.env.SECRET_KEY || "secret";
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || "googley";
const JAMBASE_API_KEY = process.env.JAMBASE_API_KEY || "jambase";

const BCRYPT_WORK_FACTOR = process.env.NODE_ENV === "test" ? 1 : 12;

module.exports = {
  DB_URI,
  SECRET_KEY,
  GOOGLE_API_KEY,
  BCRYPT_WORK_FACTOR,
  JAMBASE_API_KEY,
};