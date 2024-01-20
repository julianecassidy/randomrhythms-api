"use strict";

process.env.NODE_ENV = "test";

const db = require("../db");
const User = require("./user");
const Concert = require("./concert");
const { UnauthorizedError, BadRequestError } = require("../expressError");

beforeEach(async function () {
    await db.query("DELETE FROM users");

    async function _hashedKey(key) {
        return await bcrypt.hash(key, 1);
    }

    const testUser = ["First", "Last", "test@test.com", await _hashedKey(testKey)];

    await db.query(
        `INSERT INTO users
             VALUES ($1, $2, $3, $4)`,
        testUser
    );
});


/***************************************************************** USER CLASS */
describe("test User class", function () {
    test("can register", async function () {
        const key = await User.register({
            password: "password",
            first_name: "TestF",
            last_name: "TestL",
            email: "test@test.com"
        });

        expect(key).toEqual(expect.any(String));
    });

    test("throw 401 for bad password", async function () {
        try {
            const key = await User.register({
                password: "bad-password",
                first_name: "TestF",
                last_name: "TestL",
                email: "test@test.com"
            });
            throw new Error("fail test, you shouldn't get here");
        } catch (err) {
            expect(err instanceof UnauthorizedError).toBeTruthy();
        }
    });

    test("throw 400 for bad data", async function () {
        try {
            const key = await User.register({
                password: "password",
                first_name: "TestF",
            });
            throw new Error("fail test, you shouldn't get here");
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });

    test("throw 401 for bad password and bad data", async function () {
        try {
            const key = await User.register({
                password: "bad-password",
                first_name: "TestF",
            });
            throw new Error("fail test, you shouldn't get here");
        } catch (err) {
            expect(err instanceof UnauthorizedError).toBeTruthy();
        }
    });
});


/************************************************************** CONCERT CLASS */
describe("test getConcerts", function () {
    test("returns a list of concerts data", async function () {

    });

    test("returns an empty list if no matching concerts", async function () {

    });

    test("throw 400 if dates are invalid", async function () {
        try {
            await Concert.get("");
            throw new Error("fail test, you shouldn't get here");
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });
});


describe("test getPrices", function () {
    test("returns price", async function () {

    });

    test("returns -1 if price not found", async function () {

    });
});


describe("test getConcertDetails", function () {
    test("returns a concert", async function () {

    });

    test("throw 404 if no such concert", async function () {
        try {
            await Concert.get("not-a-concert");
            throw new Error("fail test, you shouldn't get here");
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});


describe("test getRandomConcertDetails", function () {
    test("returns a concert with all filters", async function () {

    });

    test("returns a concert without price filter", async function () {
        
    });

    test("returns empty object for no matches", async function () {
        
    });
});


afterAll(async function () {
    await db.end();
});