"use strict"; 

process.env.NODE_ENV = "test";

const app = require("../app");
const request = require("supertest");
const db = require("../db");
const bcrypt = require("bcrypt");

const testKey = "api.key123"; 

beforeEach(async function () {

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

/**************************************************************** AUTH ROUTES */

describe("POST /auth/register", function () {
    process.env.PASSWORD = "password";

    test("returns API key and stores user info", async function () {
        const response = await request(app)
            .post("/auth/register")
            .send({ firstName: "First", lastName: "Last", password: "password" })

        expect(response.statusCode).toBe(201)
        expect(response.body).toEqual({ apiKey: expect.any(String) })
    });

    test("throws 401 for wrong password", async function () {
        const response = await request(app)
            .post("/auth/register")
            .send({ firstName: "First", lastName: "Last", password: "bad_password" })

        expect(response.statusCode).toBe(401)
        expect(response.body).toEqual({
            error: {
              status: 401,
              message: `Invalid credentials`,
            },
        });
    });

    test("throws 400 for incomplete information", async function () {
        const response = await request(app)
            .post("/auth/register")
            .send({ firstName: "First", password: "password" })

        expect(response.statusCode).toBe(400)
        expect(response.body).toEqual({
            error: {
              status: 400,
              message: `lastName required`,
            },
        });
    });

    test("throws 401 for bad information and wrong password", async function () {
        const response = await request(app)
            .post("/auth/register")
            .send({ firstName: "First", password: "bad_password" })

        expect(response.statusCode).toBe(401)
        expect(response.body).toEqual({
            error: {
              status: 401,
              message: `Invalid credentials`,
            },
        });
    });
});


/************************************************************* CONCERT ROUTES */

describe("GET /concerts", function () {
    test("should return a list of concerts", async function () {
        const response = await request(app)
            .get("/concerts/")
            .query()
    });

    test("throws 401 for invalid API key", async function () {
        const response = await request(app)
            .get("/concerts/")
            .query()
    });

    test("throws 400 for invalid dates", async function () {
        const response = await request(app)
            .get("/concerts/")
            .query()
    });

    test("throws 400 for invalid zip code", async function () {
        const response = await request(app)
            .get("/concerts/")
            .query()
    });

    test("throws 401 for invalid API key and invalid dates", async function () {
        const response = await request(app)
            .get("/concerts/")
            .query()
    });

    test("throws 401 for invalid API key and bad zip code", async function () {
        const response = await request(app)
            .get("/concerts/")
            .query()
    });
})


describe("GET /concert/:id", function () {
    test("should return a concert", async function () {
        const response = await request(app)
            .get("/concerts/")
            .query()
    });

    test("throws 401 for invalid API key", async function () {
        const response = await request(app)
            .get("/concerts/")
            .query()
    });

    test("throws 400 for not found id", async function () {
        const response = await request(app)
            .get("/concerts/")
            .query()
    });

    test("throws 401 for invalid API key and not found id", async function () {
        const response = await request(app)
            .get("/concerts/")
            .query()
    });
});


describe("GET /concert/random", function () {
    test("should return a concert with all filters", async function () {
        const response = await request(app)
        .get("/concerts/")
        .query()
    });

    test("should return a concert with dates and zip code", async function () {
        const response = await request(app)
        .get("/concerts/")
        .query()
    });

    test("throws 401 for invalid API key", async function () {
        const response = await request(app)
            .get("/concerts/")
            .query()
    });

    test("throws 400 for invalid dates", async function () {
        const response = await request(app)
            .get("/concerts/")
            .query()
    });

    test("throws 400 for invalid data", async function () {
        const response = await request(app)
            .get("/concerts/")
            .query()
    });

    test("throws 401 for invalid API key and invalid dates", async function () {
        const response = await request(app)
            .get("/concerts/")
            .query()
    });

    test("throws 401 for invalid API key and bad zip code", async function () {
        const response = await request(app)
            .get("/concerts/")
            .query()
    });
});