"use strict";

/** Routes for authentication. */

const express = require("express");
const router = new express.Router();

const jsonschema = require("jsonschema");

const { User } = require("../models/user");
const { createToken } = require("../helpers/token");
const loginSchema = require("../schemas/login.json");
const signupSchema = require("../schemas/signup.json");
const { BadRequestError } = require("../helpers/expressError");

module.exports = router;


/** POST /auth/register:   { user } => { token }
 *
 * user must include { email, password, name, code }
 *
 * Returns JWT token which can be used to authenticate further requests.
 *
 * Authorization required: none
 */
router.post("/register", async function (req, res) {
    const validation = jsonschema.validate(
        req.body,
        signupSchema,
        { required: true }
        );
        
        if (!validation.valid) {
        const errs = validation.errors.map(e => e.stack);
        throw new BadRequestError(errs);
    }

    const newUser = await User.register(req.body);
    const token = createToken(newUser);
    return res.status(201).json({ token });
});

/** POST /auth/login:  { email, password } => { token }
 *
 * Returns JWT token which can be used to authenticate further requests.
 *
 * Authorization required: none
 */

router.post("/login", async function (req, res, next) {
    const validation = jsonschema.validate(
      req.body,
      loginSchema,
      {required: true}
    );
    if (!validation.valid) {
      const errs = validation.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }
  
    const { email, password } = req.body;

    const user = await User.authenticate(email, password);
    const token = createToken(user);
    return res.json({ token });
  });




