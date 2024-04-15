"use strict";

const db = require("../db");
const bcrypt = require("bcrypt");
const { BadRequestError, UnauthorizedError } = require("../helpers/expressError");
const SIGN_UP_CODE = process.env.SIGN_UP_CODE;

const { BCRYPT_WORK_FACTOR } = require("../config.js");

/** Users. */
class User {

    /** Register user with email, name, password, and code.
     * Returns { id, email, name, code}
     * Throws BadRequestError for missing data oa duplicate email.
     * Throws UnauthorizedError for invalid sign up code.
     */
    static async register({ email, name, password, signupCode }) {
        // check valid sign up code
        if (!this.validateSignUpCode(signupCode)) {
            throw new UnauthorizedError("Invalid sign up code!");
        }

        // check unique email
        const duplicateCheck = await db.query(`
            SELECT email
            FROM users
            WHERE email = $1`, [email],
        );

        if (duplicateCheck.rows.length > 0) {
            throw new BadRequestError(`Email already in use.`);
        }

        const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

        try {
            const result = await db.query(`
                INSERT INTO users (email, name, password)
                VALUES ($1, $2, $3)
                RETURNING id, email, name`,
                [email, name, hashedPassword]);

            const user = result.rows[0];

            return user;
        } catch (err) {
            throw new BadRequestError("Unable to add user.");
        }
    }

    /** Validate signup code. Returns boolean. */
    static validateSignUpCode(code) {
        return code === SIGN_UP_CODE;
    }

    /** Authenticate user with email and password.
     * Returns { id, email, name }
     * Throws UnauthorizedError if user is not found or credentials are wrong.
     */
    static async authenticate(email, password) {
        const result = await db.query(`
            SELECT id
                  , email
                  , password
                  , name
            FROM users
            WHERE email = $1`, [email]);

        const user = result.rows[0];

        if (user) {
            const validPassword = await bcrypt.compare(password, user.password);
            if (validPassword === true) {
                delete user.password;
                return user;
            }
        }

        throw new UnauthorizedError("Invalid email/password");
    }
}


module.exports = { User };