"use strict";

process.env.NODE_ENV = "test";
process.env.SIGN_UP_CODE = "test_code";

const app = require("../app");
const request = require("supertest");
const db = require("../db");

const fetchMock = require("fetch-mock");
const _ = require("lodash");

const { User } = require("../models/user");
const { JAMBASE_API_KEY } = require("../config");
const { JAMBASE_BASE_URL } = require("../models/concert");
const { GOOGLE_BASE_URL } = require("../helpers/zipToCoords");
const { createToken } = require("../helpers/token");
const { GET_CONCERTS_API_RESP, GET_CONCERT_API_RESP } = require("./_testCommon");

beforeAll(async function () {
    await db.query("DELETE FROM users");
})

beforeEach(async function () {

    fetchMock.reset();
    jest.clearAllMocks();

    await db.query("BEGIN");

    await User.register({
        name: "Test",
        email: "test@test.com",
        password: "password",
        signupCode: "test_code",
    });

    const userQuery = await db.query(
        `SELECT id, name, email
        FROM users`
    );

    const user = userQuery.rows[0];
    const token = createToken({ id: user.id, name: user.name, email: user.email });
});

afterEach(async function () {
    await db.query("ROLLBACK");
})

/**************************************************************** AUTH ROUTES */

describe("POST /auth/register", function () {

    test("returns API key and stores user info", async function () {
        const response = await request(app)
            .post("/auth/register")
            .send({
                name: "Name",
                email: "email@test.com",
                password: "password",
                signupCode: "test_code"
            });

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
                signupCode: "wrong"
            });

        expect(response.statusCode).toBe(401)
        expect(response.body).toEqual({
            error: {
                status: 401,
                message: `Invalid sign up code!`,
            },
        });
    });

    test("throws 400 for incomplete data", async function () {
        const response = await request(app)
            .post("/auth/register")
            .send({
                name: "Name",
                password: "password",
                signupCode: "test_code"
            });

        expect(response.statusCode).toBe(400)
        expect(response.body).toEqual({
            error: {
                status: 400,
                message: [
                    "instance requires property \"email\"",
                ],
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
                signupCode: "test_code"
            });

        expect(response.statusCode).toBe(400)
        expect(response.body).toEqual({
            error: {
                status: 400,
                message: [
                    "instance.email is not of a type(s) string",
                ],
            },
        });
    });

    test("throws 400 for too short password", async function () {
        const response = await request(app)
            .post("/auth/register")
            .send({
                name: "Name",
                email: "test@test.com",
                password: "short",
                signupCode: "test_code"
            });

        expect(response.statusCode).toBe(400)
        expect(response.body).toEqual({
            error: {
                status: 400,
                message: [
                    "instance.password does not meet minimum length of 8",
                ],
            },
        });
    });

    test("throws 400 for incomplete data and wrong sign up code", async function () {
        const response = await request(app)
            .post("/auth/register")
            .send({
                name: "Name",
                password: "password",
                signupCode: "wrong"
            });

        expect(response.statusCode).toBe(400)
        expect(response.body).toEqual({
            error: {
                status: 400,
                message: [
                    "instance requires property \"email\"",
                ],
            },
        });
    });
});


describe("POST /auth/login", function () {
    test("works with correct credentials", async function () {
        const response = await request(app)
            .post("/auth/login")
            .send({
                email: "test@test.com",
                password: "password",
            });

        expect(response.body).toEqual({
            "token": expect.any(String),
        });
    });

    test("throws 401 for non-existent user", async function () {
        const response = await request(app)
            .post("/auth/login")
            .send({
                email: "nosuchemail@test.com",
                password: "password",
            });

        expect(response.statusCode).toEqual(401);
    });

    test("throws 401 for wrong password", async function () {
        const response = await request(app)
            .post("/auth/login")
            .send({
                email: "test@test.com",
                password: "wrongpassword",
            });

        expect(response.statusCode).toEqual(401);
    });

    test("throws 400 for incomplete data", async function () {
        const response = await request(app)
            .post("/auth/login")
            .send({
                email: "test@test.com",
            });

        expect(response.statusCode).toEqual(400);
        expect(response.body).toEqual({
            error: {
                status: 400,
                message: [
                    "instance requires property \"password\"",
                ],
            },
        });
    });

    test("throws 400 for invalid data", async function () {
        const response = await request(app)
            .post("/auth/login")
            .send({
                email: 100,
                password: "wrongpassword",
            });

        expect(response.statusCode).toEqual(400);
        expect(response.body).toEqual({
            error: {
                status: 400,
                message: [
                    "instance.email is not of a type(s) string",
                ],
            },
        });
    });

    test("throws 400 for too short password", async function () {
        const response = await request(app)
            .post("/auth/login")
            .send({
                email: "test@test.com",
                password: "short",
            });

        expect(response.statusCode).toEqual(400);
        expect(response.body).toEqual({
            error: {
                status: 400,
                message: [
                    "instance.password does not meet minimum length of 8",
                ],
            },
        });
    });
})


/************************************************************* CONCERT ROUTES */
// MOCKED VERSIONS. RUN WITHOUT RESTRAINT.

// describe("GET /concerts", function () {
//     const params = new URLSearchParams({
//         apikey: JAMBASE_API_KEY,
//         eventDateFrom: "2024-01-01",
//         eventDateTo: "2024-01-02",
//         geoLatitude: 39.644843,
//         geoLongitude: -104.968091,
//         geoRadiusAmount: 50,
//         geoRadiusUnits: "mi"
//     });

//     fetchMock.get(`${JAMBASE_BASE_URL}/events?${params}`, {
//         status: 200,
//         body: { GET_CONCERTS_API_RESP },
//     })

//     const validConcertQuery = { 
//         dateFrom: "2024-01-01", 
//         dateTo: "2024-01-02", 
//         zip: 80113 
//     };

//     test("should return a list of concerts", async function () {
//         const response = await request(app)
//             .get("/concerts/")
//             .query(validConcertQuery)
//             .set("authorization", `Bearer ${token}`);

//         expect(response.body).toEqual({
//             concerts: [{
//                 jambase_id: "jambase:11070750",
//                 headliner: {
//                     name: "Ben Rector",
//                     band_image,_url: "https://www.jambase.com/wp-content/uploads/2023/01/ben-rector-1480x832.png", 
//                     genres: ["folk", "indie", "pop", "rock" ]
//                 },
//                 openers: ["Cody Fry"],
//                 venue: {
//                     name: "Boettcher Concert Hall",
//                     venue_image_url: "",
//                     streetAddress: "1400 Curtis Street",
//                     city: "Denver",
//                     state: "CO",
//                     zipCode: "80202"
//                 },
//                 cost: "",
//                 date_time: "2024-02-01T19:30:00",
//                 ticket_url: "https://coloradosymphony.org/?utm_source=jambase",
//                 event_status: "scheduled"
//             }, {
//                 jambase_id: "jambase:11297801",
//                 headliner: {
//                     name: "Silent Planet",
//                     band_image,_url: "https://www.jambase.com/wp-content/uploads/2017/04/silent-planet-silent-planet-0ddd54a3-9fb1-4314-a48d-8ace7dafd1a7_279581_TABLET_LANDSCAPE_LARGE_16_9-1480x832.jpg", 
//                     genres: ["metal", "punk"]
//                 },
//                 openers: ["Thornhill", "Aviana", "Johnny Booth"],
//                 venue: {
//                     name: "Summit Music Hall",
//                     venue_image_url: "",
//                     streetAddress: "1902 Blake St",
//                     city: "Denver",
//                     state: "CO",
//                     zipCode: "80202"
//                 },
//                 cost: "22.00",
//                 date_time: "2024-02-01T18:00:00",
//                 ticket_url: "https://ticketmaster.evyy.net/c/252938/264167/4272?u=https%3A%2F%2Fconcerts.livenation.com%2Fsilent-planet-denver-colorado-02-01-2024%2Fevent%2F1E005F6E984C10F1",
//                 event_status: "scheduled"
//             }]
//         });
//     });

//     test("throws 401 for invalid token", async function () {
//         const response = await request(app)
//             .get("/concerts/")
//             .query(validConcertQuery)
//             .set("authorization", `Bearer wrong`);

//         expect(response.statusCode).toEqual(401)
//     });

//     test("throws 400 for invalid dates in the past", async function () {
//         const params = new URLSearchParams({
//             apikey: JAMBASE_API_KEY,
//             eventDateFrom: "2023-01-01",
//             eventDateTo: "2023-01-02",
//             geoLatitude: 39.644843,
//             geoLongitude: -104.968091,
//             geoRadiusAmount: 50,
//             geoRadiusUnits: "mi"
//         });

//         fetchMock.get(`${JAMBASE_BASE_URL}/events?${params}`, {
//             status: 400,
//             body: {
//                 "success": false,
//                 "errors": [
//                   {
//                     "code": "invalid_param",
//                     "message": "The `eventDateFrom` must be on or after 2024-01-31."
//                   }
//                 ]},
//         });

//         const response = await request(app)
//             .get("/concerts/")
//             .query({ ...validConcertQuery, dateFrom: "2023-01-01", dateTo: "2023-01-02" })
//             .set("authorization", `Bearer ${token}`);

//         expect(response.statusCode).toEqual(400);
//     });

//     test("throws 400 for invalid dates start after finish", async function () {
//         const params = new URLSearchParams({
//             apikey: JAMBASE_API_KEY,
//             eventDateFrom: "2024-02-01",
//             eventDateTo: "2024-01-02",
//             geoLatitude: 39.644843,
//             geoLongitude: -104.968091,
//             geoRadiusAmount: 50,
//             geoRadiusUnits: "mi"
//         });

//         fetchMock.get(`${JAMBASE_BASE_URL}/events?${params}`, {
//             status: 200,
//             body: {
//                 "success": true,
//                 "pagination": {
//                     "page": 1,
//                     "perPage": 40,
//                     "totalItems": 0,
//                     "totalPages": 1,
//                     "nextPage": null,
//                     "previousPage": null
//                 },
//                 "events": []
//             },
//         });

//         const response = await request(app)
//             .get("/concerts/")
//             .query({ ...validConcertQuery, dateFrom: "2024-02-01", dateTo: "2024-01-02" })
//             .set("authorization", `Bearer ${token}`);

//         expect(response.statusCode).toEqual(400);
//     });

//     test("throws 400 for invalid zip code", async function () {
//         const invalidZip = "00000";

//         const testParams = new URLSearchParams({
//             components: `postal_code:${invalidZip}|country:US`,
//             key: GOOGLE_API_KEY,
//         });

//         fetchMock.get(`${GOOGLE_BASE_URL}?${testParams}`, {
//           status: 200,
//           body: {
//             "results": [],
//             "status": "ZERO_RESULTS"
//             }
//         });

//         const response = await request(app)
//             .get("/concerts/")
//             .query({ ...validConcertQuery, zip: "00000" })
//             .set("authorization", `Bearer ${token}`);

//         expect(response.statusCode).toEqual(400);
//     });

//     test("throws 401 for invalid token and invalid dates", async function () {
//         const response = await request(app)
//             .get("/concerts/")
//             .query({ ...validConcertQuery, dateFrom: "2024-02-01", dateTo: "2024-01-02" })
//             .set("authorization", `Bearer wrong`);

//         expect(response.statusCode).toEqual(401);
//     });

//     test("throws 401 for invalid token and invalid zip code", async function () {
//         const response = await request(app)
//             .get("/concerts/")
//             .query({ ...validConcertQuery, zip: "00000" })
//             .set("authorization", `Bearer wrong`);

//         expect(response.statusCode).toEqual(401);
//     });
// })


// describe("GET /concert/:id", function () {
//     const testConcertId = "jambase:123";

//     fetchMock.get(
//         `${JAMBASE_BASE_URL}/events/id/${testConcertId}?key=${JAMBASE_API_KEY}`, {
//         status: 200,
//         body: { GET_CONCERT_API_RESP }
//     });

//     test("should return a concert", async function () {
//         const response = await request(app)
//             .get(`/concerts/${testConcertId}`)
//             .set("authorization", `Bearer ${token}`);

//         expect(response.body).toEqual({
//             concert: {
//                 jambase_id: "jambase:11070750",
//                 headliner: {
//                     name: "Ben Rector",
//                     band_image,_url: "https://www.jambase.com/wp-content/uploads/2023/01/ben-rector-1480x832.png", 
//                     genres: ["folk", "indie", "pop", "rock" ]
//                 },
//                 openers: ["Cody Fry"],
//                 venue: {
//                     name: "Boettcher Concert Hall",
//                     venue_image_url: "",
//                     streetAddress: "1400 Curtis Street",
//                     city: "Denver",
//                     state: "CO",
//                     zipCode: "80202"
//                 },
//                 cost: "",
//                 date_time: "2024-02-01T19:30:00",
//                 ticket_url: "https://coloradosymphony.org/?utm_source=jambase",
//                 event_status: "scheduled"
//             }
//         });
//     });

//     test("throws 401 for invalid token", async function () {
//         const response = await request(app)
//             .get(`/concerts/${testConcertId}`)
//             .set("authorization", `Bearer wrong`);

//         expect(response.statusCode).toEqual(401);
//     });

//     test("throws 404 for not found concert id", async function () {
//         const invalidConcertId = "not-a-concert";

//         fetchMock.get(
//             `${JAMBASE_BASE_URL}/events/id/${invalidConcertId}?key=${JAMBASE_API_KEY}`, {
//             status: 400,
//             body: {
//                 "success": false,
//                 "errors": [
//                     {
//                         "code": "identifier_invalid",
//                         "message": "No event found for `jambase` event id `not-a-concert`"
//                     }
//                 ]
//             }
//         });

//         const response = await request(app)
//             .get("/concerts/not-a-concert")
//             .set("authorization", `Bearer ${token}`);

//             expect(response.statusCode).toEqual(404);
//         });    

//     test("throws 401 for invalid token and not found concert id", async function () {
//         const response = await request(app)
//             .get("/concerts/not-a-concert")
//             .set("authorization", `Bearer wrong`);

//         expect(response.statusCode).toEqual(401);
//     });         
// });


// describe("GET /concert/random", function () {

//     const params = new URLSearchParams({
//         apikey: JAMBASE_API_KEY,
//         eventDateFrom: "2024-01-01",
//         eventDateTo: "2024-01-02",
//         geoLatitude: 39.644843,
//         geoLongitude: -104.968091,
//         geoRadiusAmount: 5,
//         geoRadiusUnits: "mi"
//     });

//     fetchMock.get(`${JAMBASE_BASE_URL}/events?${params}`, {
//         status: 200,
//         body: { GET_CONCERTS_API_RESP },
//     });

//     const validRandomQuery = { 
//         dateFrom: "2024-01-01",
//         dateTo: "2024-01-02", 
//         zipCode: 80113, 
//         distance: 5, 
//         price: 30,
//     }; 

//     test("should return a concert with all filters", async function () {
//         const response = await request(app)
//         .get("/concerts/random")
//         .query(validRandomQuery)
//         .set("authorization", `Bearer ${token}`);

//         expect(response.body).toEqual({
//             randomConcert: {
//                 jambase_id: "jambase:11297801",
//                 headliner: {
//                     name: "Silent Planet",
//                     band_image,_url: "https://www.jambase.com/wp-content/uploads/2017/04/silent-planet-silent-planet-0ddd54a3-9fb1-4314-a48d-8ace7dafd1a7_279581_TABLET_LANDSCAPE_LARGE_16_9-1480x832.jpg", 
//                     genres: ["metal", "punk"]
//                 },
//                 openers: ["Thornhill", "Aviana", "Johnny Booth"],
//                 venue: {
//                     name: "Summit Music Hall",
//                     venue_image_url: "",
//                     streetAddress: "1902 Blake St",
//                     city: "Denver",
//                     state: "CO",
//                     zipCode: "80202"
//                 },
//                 cost: "22.00",
//                 date_time: "2024-02-01T18:00:00",
//                 ticket_url: "https://ticketmaster.evyy.net/c/252938/264167/4272?u=https%3A%2F%2Fconcerts.livenation.com%2Fsilent-planet-denver-colorado-02-01-2024%2Fevent%2F1E005F6E984C10F1",
//                 event_status: "scheduled"
//             }
//         });
//     });

//     test("should return a concert with dates and zip code", async function () {
//         const spySampleLodash = jest.spyOn(_, 'sample');

//         const response = await request(app)
//         .get("/concerts/")
//         .query({ 
//             dateFrom: "2024-01-01",
//             dateTo: "2024-01-02", 
//             zipCode: 80113,
//         })
//         .set("authorization", `Bearer ${token}`);

//         expect(spySampleLodash).toHaveBeenCalledWith(GET_CONCERTS_API_RESP);
//     });

//     test("throws 401 for invalid token", async function () {
//         const response = await request(app)
//             .get("/concerts/")
//             .query(validRandomQuery)
//             .set("authorization", `Bearer wrong`);

//     });

//     test("throws 400 for invalid dates", async function () {
//         const response = await request(app)
//             .get("/concerts/")
//             .query({ ...validRandomQuery, dateFrom: "2024-02-01", dateTo: "2024-01-01"})
//             .set("authorization", `Bearer ${token}`);

//         expect(response.statusCode).toEqual(400);
//     });

//     test("throws 400 for invalid data", async function () {
//         const response = await request(app)
//             .get("/concerts/")
//             .query({ price: "not a price"})
//             .set("authorization", `Bearer ${token}`);

//         expect(response.statusCode).toEqual(400);
//     });

//     test("throws 400 for invalid zip code", async function () {
//         const invalidZip = "00000";

//         const testParams = new URLSearchParams({
//             components: `postal_code:${invalidZip}|country:US`,
//             key: GOOGLE_API_KEY,
//         });

//         fetchMock.get(`${GOOGLE_BASE_URL}?${testParams}`, {
//           status: 200,
//           body: {
//             "results": [],
//             "status": "ZERO_RESULTS"
//             }
//         });

//         const response = await request(app)
//             .get("/concerts/")
//             .query({ ...validRandomQuery, zip: "00000" })
//             .set("authorization", `Bearer ${token}`);

//         expect(response.statusCode).toEqual(400);
//     });

//     test("throws 401 for invalid token and invalid dates", async function () {
//         const response = await request(app)
//             .get("/concerts/")
//             .query({ ...validRandomQuery, dateFrom: "2024-02-01", dateTo: "2024-01-01"})
//             .set("authorization", `Bearer wrong`);

//         expect(response.statusCode).toEqual(401);
//     });

//     test("throws 401 for invalid token and bad zip code", async function () {
//         const response = await request(app)
//             .get("/concerts/")
//             .query({ ...validRandomQuery, zip: "00000" })
//             .set("authorization", `Bearer wrong`);

//             expect(response.statusCode).toEqual(401);
//     });
// });


afterAll(async function () {
    await db.end();
})