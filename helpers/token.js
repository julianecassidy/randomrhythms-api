"use strict";

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

/** Return signed JWT from user data {id, email, name} . */

function createToken(user) {

  return jwt.sign(user, SECRET_KEY);
}

module.exports = { createToken };
