"use strict";

/** Convenience middleware to handle common auth cases and rate limiting in
 * routes. */

const jwt = require("jsonwebtoken");
const { rateLimit } = require('express-rate-limit');
const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../helpers/expressError");

/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals (this will include the username and isAdmin field.)
 *
 * It's not an error if no token was provided or if the token is not valid.
 */

function authenticateJWT(req, res, next) {
    const authHeader = req.headers?.authorization;
    if (authHeader) {
        const token = authHeader.replace(/^[Bb]earer /, "").trim();

        try {
            res.locals.user = jwt.verify(token, SECRET_KEY);
        } catch (err) {
            /* ignore invalid tokens (but don't store user!) */
        }
    }
    return next();

}

/** Middleware to ensure a logged in user.
 *
 * If not, raises Unauthorized.
 */

function ensureLoggedIn(req, res, next) {
    if (res.locals.user?.email) return next();
    throw new UnauthorizedError();
}

/** Middleware to limit requests by IP.
  */
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 30, // Limit each IP to 30 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})



module.exports = { authenticateJWT, ensureLoggedIn, limiter };