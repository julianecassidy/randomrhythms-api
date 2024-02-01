"use strict"; 

process.env.NODE_ENV = "test";

const app = require("../app");
const request = require("supertest");
const db = require("../db");

beforeAll(async function () {
    await db.query("DELETE FROM users");
})

beforeEach(async function () {
    
    await db.query("BEGIN");

    await User.register({
        name: "Test",
        email: "test@test.com",
        password: "password"
    });

    const userQuery = await db.query(
        `SELECT id, name, email
        FROM users`
    );

    const user = userQuery[0];
    const token = createToken({ id: user.id, name: user.name, email: user.email });
});

afterEach(async function () {
    await db.query("ROLLBACK");
})

/**************************************************************** AUTH ROUTES */

describe("POST /auth/register", function () {
    process.env.SIGN_UP_CODE = "test_code";

    test("returns API key and stores user info", async function () {
        const response = await request(app)
            .post("/auth/register")
            .send({ 
                name: "Name", 
                email: "email@test.com", 
                password: "password", 
                code: "test_code" 
            })

        expect(response.statusCode).toBe(201)
        expect(response.body).toEqual({ token: expect.any(String) })
    });

    test("throws 401 for wrong sign up code", async function () {
        const response = await request(app)
            .post("/auth/register")
            .send({ 
                name: "Name", 
                email: "email@test.com", 
                password: "password", 
                code: "wrong" 
            })
        expect(response.statusCode).toBe(401)
        expect(response.body).toEqual({
            error: {
              status: 401,
              message: `Invalid credentials`,
            },
        });
    });

    test("throws 400 for incomplete data", async function () {
        const response = await request(app)
            .post("/auth/register")
            .send({ 
                name: "Name", 
                password: "password", 
                code: "test_code" 
            })

        expect(response.statusCode).toBe(400)
        expect(response.body).toEqual({
            error: {
              status: 400,
              message: "email required",
            },
        });
    });

    test("throws 400 for invalid data", async function () {
        const response = await request(app)
            .post("/auth/register")
            .send({ 
                name: "Name", 
                email: 100,
                password: "password", 
                code: "test_code" 
            })

        expect(response.statusCode).toBe(400)
        expect(response.body).toEqual({
            error: {
              status: 400,
              message: "email required",
            },
        });
    });

    test("throws 401 for incomplete data and wrong sign up code", async function () {
        const response = await request(app)
            .post("/auth/register")
            .send({ 
                name: "Name", 
                password: "password", 
                code: "wrong" 
            })

        expect(response.statusCode).toBe(401)
        expect(response.body).toEqual({
            error: {
              status: 401,
              message: "Invalid credentials",
            },
        });
    });
});


describe("POST /auth/login", function () {
    test("works with correct credentials", async function () {
        const resp = await request(app)
            .post("/auth/token")
            .send({
            email: "test@test.com",
            password: "password",
        });

        expect(resp.body).toEqual({
            "token": expect.any(String),
          });
    });

    test("throws 401 for non-existent user", async function () {
        const resp = await request(app)
            .post("/auth/token")
            .send({
              email: "no-such-user",
              password: "password",
            });

        expect(resp.statusCode).toEqual(401);
      });
    
      test("throws 401 for wrong password", async function () {
        const resp = await request(app)
            .post("/auth/token")
            .send({
              email: "test@test.com",
              password: "wrong",
            });

        expect(resp.statusCode).toEqual(401);
      });
    
      test("throws 400 for missing data", async function () {
        const resp = await request(app)
            .post("/auth/token")
            .send({
              email: "test@test.com",
            });

        expect(resp.statusCode).toEqual(400);
      });
    
      test("throws 400 for invalid data", async function () {
        const resp = await request(app)
            .post("/auth/token")
            .send({
              email: 100,
              password: "wrong",
            });

        expect(resp.statusCode).toEqual(400);
      });    
})


/************************************************************* CONCERT ROUTES */

describe("GET /concerts", function () {
    test("should return a list of concerts", async function () {
        const response = await request(app)
            .get("/concerts/")
            .query()
            .set("authorization", `Bearer ${token}`);
    });

    test("throws 401 for invalid token", async function () {
        const response = await request(app)
            .get("/concerts/")
            .query()
            .set("authorization", `Bearer wrong`);

    });

    test("throws 400 for invalid dates", async function () {
        const response = await request(app)
            .get("/concerts/")
            .query()
            .set("authorization", `Bearer ${token}`);

    });

    test("throws 400 for invalid zip code", async function () {
        const response = await request(app)
            .get("/concerts/")
            .query()
            .set("authorization", `Bearer ${token}`);

    });

    test("throws 401 for invalid token and invalid dates", async function () {
        const response = await request(app)
            .get("/concerts/")
            .query()
            .set("authorization", `Bearer wrong`);

    });

    test("throws 401 for invalid token and bad zip code", async function () {
        const response = await request(app)
            .get("/concerts/")
            .query()
            .set("authorization", `Bearer wrong`);

    });
})


describe("GET /concert/:id", function () {
    test("should return a concert", async function () {
        const response = await request(app)
            .get("/concerts/")
            .query()
            .set("authorization", `Bearer ${token}`);

    });

    test("throws 401 for invalid token", async function () {
        const response = await request(app)
            .get("/concerts/")
            .query()
            .set("authorization", `Bearer wrong`);

    });

    test("throws 400 for not found id", async function () {
        const response = await request(app)
            .get("/concerts/")
            .query()
            .set("authorization", `Bearer ${token}`);

    });

    test("throws 401 for invalid token and not found id", async function () {
        const response = await request(app)
            .get("/concerts/")
            .query()
            .set("authorization", `Bearer wrong`);

    });
});


describe("GET /concert/random", function () {
    test("should return a concert with all filters", async function () {
        const response = await request(app)
        .get("/concerts/")
        .query()
        .set("authorization", `Bearer ${token}`);

    });

    test("should return a concert with dates and zip code", async function () {
        const response = await request(app)
        .get("/concerts/")
        .query()
        .set("authorization", `Bearer ${token}`);

    });

    test("throws 401 for invalid token", async function () {
        const response = await request(app)
            .get("/concerts/")
            .query()
            .set("authorization", `Bearer wrong`);

    });

    test("throws 400 for invalid dates", async function () {
        const response = await request(app)
            .get("/concerts/")
            .query()
            .set("authorization", `Bearer ${token}`);

    });

    test("throws 400 for invalid data", async function () {
        const response = await request(app)
            .get("/concerts/")
            .query()
            .set("authorization", `Bearer ${token}`);

    });

    test("throws 401 for invalid token and invalid dates", async function () {
        const response = await request(app)
            .get("/concerts/")
            .query()
            .set("authorization", `Bearer wrong`);

    });

    test("throws 401 for invalid token and bad zip code", async function () {
        const response = await request(app)
            .get("/concerts/")
            .query()
            .set("authorization", `Bearer wrong`);

    });
});


afterAll(async function () {
    await db.end();
})