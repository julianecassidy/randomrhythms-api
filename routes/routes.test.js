"use strict";

process.env.NODE_ENV = "test";
process.env.SIGN_UP_CODE = "test_code";

const app = require("../app");
const request = require("supertest");
const db = require("../db");

const fetchMock = require("fetch-mock");
const _ = require("lodash");

const { User } = require("../models/user");
const { Concert } = require("../models/concert");
const { JAMBASE_API_KEY, GOOGLE_API_KEY } = require("../config");
const { JAMBASE_BASE_URL } = require("../models/concert");
const { GOOGLE_BASE_URL_GEOCODE } = require("../helpers/zipToCoords");
const {
    commonBeforeAll,
    GET_CONCERTS_API_RESP,
    GET_CONCERT_API_RESP
} = require("./_testCommon");
const { createToken } = require("../helpers/token");
const { DateValidation } = require("../helpers/validators");
const { Distance } = require("../helpers/getDistance");

let testToken;

beforeAll(async function () {
    await commonBeforeAll();

    const userQuery = await db.query(
        `SELECT id, name, email
        FROM users`
    );
    const user = userQuery.rows[0];

    testToken = createToken({ id: user.id, name: user.name, email: user.email });
});

beforeEach(async function () {
    jest.clearAllMocks();

    await db.query("BEGIN");
});

afterEach(async function () {
    fetchMock.restore();

    await db.query("ROLLBACK");
});

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

        expect(response.statusCode).toBe(201);
        expect(response.body).toEqual({ token: expect.any(String) });
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

        expect(response.statusCode).toBe(401);
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

        expect(response.statusCode).toBe(400);
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

        expect(response.statusCode).toBe(400);
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

        expect(response.statusCode).toBe(400);
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

        expect(response.statusCode).toBe(400);
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
});


/************************************************************* CONCERT ROUTES */
// MOCKED VERSIONS. RUN WITHOUT RESTRAINT.

describe("GET /concerts", function () {
    const validConcertQuery = {
        dateFrom: "2024-01-01",
        dateTo: "2024-01-02",
        zipCode: 80113
    };

    DateValidation.validateDates = jest.fn();
    Distance.getDistance = jest.fn();

    test("should return a list of concerts", async function () {
        DateValidation.validateDates.mockReturnValue(true);
        Distance.getDistance.mockReturnValue(9.8);

        const zipCodeParams = new URLSearchParams({
            components: `postal_code:80113|country:US`,
            key: GOOGLE_API_KEY,
        });

        fetchMock.get(`${GOOGLE_BASE_URL_GEOCODE}?${zipCodeParams}`, {
            status: 200,
            body: {
                "results": [{
                    "geometry": {
                        "location": {
                            "lat": 39.644843,
                            "lng": -104.968091
                        },
                    },
                }],
                "status": "OK"
            }
        });

        const concertParams = new URLSearchParams({
            eventDateFrom: "2024-01-01",
            eventDateTo: "2024-01-02",
            geoLatitude: 39.644843,
            geoLongitude: -104.968091,
            geoRadiusAmount: 50,
            geoRadiusUnits: "mi",
            apikey: JAMBASE_API_KEY,
        });

        fetchMock.get(`${JAMBASE_BASE_URL}events?${concertParams}`, {
            status: 200,
            body: GET_CONCERTS_API_RESP,
        });

        const response = await request(app)
            .get("/concerts/")
            .query(validConcertQuery)
            .set("authorization", `Bearer ${testToken}`);

        expect(response.body).toEqual({
            concerts: [{
                jambaseId: "jambase:11070750",
                headliner: {
                    name: "Ben Rector",
                    bandImageUrl: "https://www.jambase.com/wp-content/uploads/2023/01/ben-rector-1480x832.png",
                    genres: ["folk", "indie", "pop", "rock"]
                },
                openers: ["Cody Fry"],
                venue: {
                    name: "Boettcher Concert Hall",
                    venueImageUrl: "",
                    streetAddress: "1400 Curtis Street",
                    city: "Denver",
                    state: "CO",
                    zipCode: "80202",
                    distance: 9.8
                },
                cost: "",
                dateTime: "2024-02-01T19:30:00",
                ticketUrl: "https://coloradosymphony.org/?utm_source=jambase",
                eventStatus: "scheduled",
                eventSource: "jambase"
            }, {
                jambaseId: "jambase:11297801",
                headliner: {
                    name: "Silent Planet",
                    bandImageUrl: "https://www.jambase.com/wp-content/uploads/2017/04/silent-planet-silent-planet-0ddd54a3-9fb1-4314-a48d-8ace7dafd1a7_279581_TABLET_LANDSCAPE_LARGE_16_9-1480x832.jpg",
                    genres: ["metal", "punk"]
                },
                openers: ["Thornhill", "Aviana", "Johnny Booth"],
                venue: {
                    name: "Summit Music Hall",
                    venueImageUrl: "",
                    streetAddress: "1902 Blake St",
                    city: "Denver",
                    state: "CO",
                    zipCode: "80202",
                    distance: 9.8
                },
                cost: "22.00",
                dateTime: "2024-02-01T18:00:00",
                ticketUrl: "https://ticketmaster.evyy.net/c/252938/264167/4272?u=https%3A%2F%2Fconcerts.livenation.com%2Fsilent-planet-denver-colorado-02-01-2024%2Fevent%2F1E005F6E984C10F1",
                eventStatus: "scheduled",
                eventSource: "jambase"
            }]
        });
    });

    test("throws 401 for invalid token", async function () {
        const response = await request(app)
            .get("/concerts/")
            .query(validConcertQuery)
            .set("authorization", `Bearer wrong`);

        expect(response.statusCode).toEqual(401);
    });

    test("throws 400 for invalid dates", async function () {
        DateValidation.validateDates.mockReturnValue(false);
        Distance.getDistance.mockReturnValue(9.8);

        const invalidParams = new URLSearchParams({
            eventDateFrom: "2023-01-01",
            eventDateTo: "2023-01-02",
            geoLatitude: 39.644843,
            geoLongitude: -104.968091,
            geoRadiusAmount: 50,
            geoRadiusUnits: "mi",
            apikey: JAMBASE_API_KEY,
        });

        fetchMock.get(`${JAMBASE_BASE_URL}events?${invalidParams}`, {
            status: 400,
            body: {
                "success": false,
                "errors": [
                    {
                        "code": "invalid_param",
                        "message": "The `eventDateFrom` must be on or after 2024-01-31."
                    }
                ]
            },
        });

        const response = await request(app)
            .get("/concerts/")
            .query({ ...validConcertQuery, dateFrom: "2023-01-01", dateTo: "2023-01-02" })
            .set("authorization", `Bearer ${testToken}`);

        expect(response.statusCode).toEqual(400);
    });

    test("throws 400 for invalid zip code", async function () {
        const invalidZip = "00000";

        DateValidation.validateDates.mockReturnValue(true);
        Distance.getDistance.mockReturnValue(9.8);

        const testParams = new URLSearchParams({
            components: `postal_code:${invalidZip}|country:US`,
            key: GOOGLE_API_KEY,
        });

        fetchMock.get(`${GOOGLE_BASE_URL_GEOCODE}?${testParams}`, {
            status: 200,
            body: {
                "results": [],
                "status": "ZERO_RESULTS"
            }
        });

        const response = await request(app)
            .get("/concerts/")
            .query({ ...validConcertQuery, zipCode: "00000" })
            .set("authorization", `Bearer ${testToken}`);

        expect(response.statusCode).toEqual(400);
    });

    test("throws 401 for invalid token and invalid dates", async function () {
        DateValidation.validateDates.mockReturnValue(false);
        Distance.getDistance.mockReturnValue(9.8);

        const response = await request(app)
            .get("/concerts/")
            .query({ ...validConcertQuery, dateFrom: "2024-02-01", dateTo: "2024-01-02" })
            .set("authorization", `Bearer wrong`);

        expect(response.statusCode).toEqual(401);
    });

    test("throws 401 for invalid token and invalid zip code", async function () {
        DateValidation.validateDates.mockReturnValue(true);
        Distance.getDistance.mockReturnValue(9.8);

        const response = await request(app)
            .get("/concerts/")
            .query({ ...validConcertQuery, zipCode: "00000" })
            .set("authorization", `Bearer wrong`);

        expect(response.statusCode).toEqual(401);
    });
});


describe("GET /concert/:id", function () {
    const testConcertId = "123";

    test("should return a concert", async function () {
        fetchMock.get(
            `${JAMBASE_BASE_URL}events/id/jambase:${testConcertId}?apikey=${JAMBASE_API_KEY}`, {
            status: 200,
            body: GET_CONCERT_API_RESP
        });
        const response = await request(app)
            .get(`/concerts/${testConcertId}`)
            .set("authorization", `Bearer ${testToken}`);

        expect(response.body).toEqual({
            concert: {
                jambaseId: "jambase:11070750",
                headliner: {
                    name: "Ben Rector",
                    bandImageUrl: "https://www.jambase.com/wp-content/uploads/2023/01/ben-rector-1480x832.png",
                    genres: ["folk", "indie", "pop", "rock"]
                },
                openers: ["Cody Fry"],
                venue: {
                    name: "Boettcher Concert Hall",
                    venueImageUrl: "",
                    streetAddress: "1400 Curtis Street",
                    city: "Denver",
                    state: "CO",
                    zipCode: "80202",
                    distance: 9.8
                },
                cost: "",
                dateTime: "2024-02-01T19:30:00",
                ticketUrl: "https://coloradosymphony.org/?utm_source=jambase",
                eventStatus: "scheduled",
                eventSource: "jambase"
            }
        });
    });

    test("throws 401 for invalid token", async function () {
        fetchMock.get(
            `${JAMBASE_BASE_URL}events/id/jambase:${testConcertId}?apikey=${JAMBASE_API_KEY}`, {
            status: 200,
            body: GET_CONCERT_API_RESP
        });

        const response = await request(app)
            .get(`/concerts/${testConcertId}`)
            .set("authorization", `Bearer wrong`);

        expect(response.statusCode).toEqual(401);
    });

    test("throws 404 for not found concert id", async function () {
        const invalidConcertId = "00000";

        fetchMock.get(
            `${JAMBASE_BASE_URL}events/id/jambase:${invalidConcertId}?apikey=${JAMBASE_API_KEY}`, {
            status: 400,
            body: {
                "success": false,
                "errors": [
                    {
                        "code": "identifier_invalid",
                        "message": "No event found for `jambase` event id `not-a-concert`"
                    }
                ]
            }
        });

        const response = await request(app)
            .get(`/concerts/${invalidConcertId}`)
            .set("authorization", `Bearer ${testToken}`);

        expect(response.statusCode).toEqual(404);
    });

    test("throws 401 for invalid token and not found concert id", async function () {
        const invalidConcertId = "00000";

        fetchMock.get(
            `${JAMBASE_BASE_URL}events/id/jambase:${invalidConcertId}?apikey=${JAMBASE_API_KEY}`, {
            status: 400,
            body: {
                "success": false,
                "errors": [
                    {
                        "code": "identifier_invalid",
                        "message": "No event found for `jambase` event id `not-a-concert`"
                    }
                ]
            }
        });

        const response = await request(app)
            .get(`/concerts/${invalidConcertId}`)
            .set("authorization", `Bearer wrong`);

        expect(response.statusCode).toEqual(401);
    });
});


describe("GET /concerts/random", function () {

    DateValidation.validateDates = jest.fn();
    Distance.getDistance = jest.fn();

    const concertParams = new URLSearchParams({
        eventDateFrom: "2024-01-01",
        eventDateTo: "2024-01-02",
        geoLatitude: 39.644843,
        geoLongitude: -104.968091,
        geoRadiusAmount: 5,
        geoRadiusUnits: "mi",
        apikey: JAMBASE_API_KEY,
    });

    const validRandomQuery = {
        dateFrom: "2024-01-01",
        dateTo: "2024-01-02",
        zipCode: 80113,
        geoRadius: 5,
        price: 30,
    };

    test("should return a concert with all filters", async function () {
        DateValidation.validateDates.mockReturnValue(true);
        Distance.getDistance.mockReturnValue(3);

        const zipCodeParams = new URLSearchParams({
            components: `postal_code:80113|country:US`,
            key: GOOGLE_API_KEY,
        });

        fetchMock.get(`${GOOGLE_BASE_URL_GEOCODE}?${zipCodeParams}`, {
            status: 200,
            body: {
                "results": [{
                    "geometry": {
                        "location": {
                            "lat": 39.644843,
                            "lng": -104.968091
                        },
                    },
                }],
                "status": "OK"
            }
        });

        fetchMock.get(`${JAMBASE_BASE_URL}events?${concertParams}`, {
            status: 200,
            body: GET_CONCERTS_API_RESP,
        });

        const response = await request(app)
            .get("/concerts/random")
            .query(validRandomQuery)
            .set("authorization", `Bearer ${testToken}`);

        expect(response.body).toEqual({
            randomConcert: {
                jambaseId: "jambase:11297801",
                headliner: {
                    name: "Silent Planet",
                    bandImageUrl: "https://www.jambase.com/wp-content/uploads/2017/04/silent-planet-silent-planet-0ddd54a3-9fb1-4314-a48d-8ace7dafd1a7_279581_TABLET_LANDSCAPE_LARGE_16_9-1480x832.jpg",
                    genres: ["metal", "punk"]
                },
                openers: ["Thornhill", "Aviana", "Johnny Booth"],
                venue: {
                    name: "Summit Music Hall",
                    venueImageUrl: "",
                    streetAddress: "1902 Blake St",
                    city: "Denver",
                    state: "CO",
                    zipCode: "80202",
                    distance: 3
                },
                cost: "22.00",
                dateTime: "2024-02-01T18:00:00",
                ticketUrl: "https://ticketmaster.evyy.net/c/252938/264167/4272?u=https%3A%2F%2Fconcerts.livenation.com%2Fsilent-planet-denver-colorado-02-01-2024%2Fevent%2F1E005F6E984C10F1",
                eventStatus: "scheduled",
                eventSource: "jambase"
            }
        });
    });

    test("throws 401 for invalid token", async function () {
        DateValidation.validateDates.mockReturnValue(true);
        Distance.getDistance.mockReturnValue(9.8);

        const zipCodeParams = new URLSearchParams({
            components: `postal_code:80113|country:US`,
            key: GOOGLE_API_KEY,
        });

        fetchMock.get(`${GOOGLE_BASE_URL_GEOCODE}?${zipCodeParams}`, {
            status: 200,
            body: {
                "results": [{
                    "geometry": {
                        "location": {
                            "lat": 39.644843,
                            "lng": -104.968091
                        },
                    },
                }],
                "status": "OK"
            }
        });

        fetchMock.get(`${JAMBASE_BASE_URL}events?${concertParams}`, {
            status: 200,
            body: GET_CONCERTS_API_RESP,
        });

        const response = await request(app)
            .get("/concerts/random")
            .query(validRandomQuery)
            .set("authorization", `Bearer wrong`);

    });

    test("throws 400 for invalid dates", async function () {
        DateValidation.validateDates.mockReturnValue(false);
        Distance.getDistance.mockReturnValue(9.8);

        const zipCodeParams = new URLSearchParams({
            components: `postal_code:80113|country:US`,
            key: GOOGLE_API_KEY,
        });

        fetchMock.get(`${GOOGLE_BASE_URL_GEOCODE}?${zipCodeParams}`, {
            status: 200,
            body: {
                "results": [{
                    "geometry": {
                        "location": {
                            "lat": 39.644843,
                            "lng": -104.968091
                        },
                    },
                }],
                "status": "OK"
            }
        });

        fetchMock.get(`${JAMBASE_BASE_URL}events?${concertParams}`, {
            status: 200,
            body: GET_CONCERTS_API_RESP,
        });

        const response = await request(app)
            .get("/concerts/random")
            .query({ ...validRandomQuery, dateFrom: "2024-02-01", dateTo: "2024-01-01" })
            .set("authorization", `Bearer ${testToken}`);

        expect(response.statusCode).toEqual(400);
    });

    test("throws 400 for invalid data", async function () {
        DateValidation.validateDates.mockReturnValue(true);
        Distance.getDistance.mockReturnValue(9.8);

        const zipCodeParams = new URLSearchParams({
            components: `postal_code:80113|country:US`,
            key: GOOGLE_API_KEY,
        });

        fetchMock.get(`${GOOGLE_BASE_URL_GEOCODE}?${zipCodeParams}`, {
            status: 200,
            body: {
                "results": [{
                    "geometry": {
                        "location": {
                            "lat": 39.644843,
                            "lng": -104.968091
                        },
                    },
                }],
                "status": "OK"
            }
        });

        fetchMock.get(`${JAMBASE_BASE_URL}events?${concertParams}`, {
            status: 200,
            body: GET_CONCERTS_API_RESP,
        });

        const response = await request(app)
            .get("/concerts/random")
            .query({ ...validRandomQuery, price: "not a price" })
            .set("authorization", `Bearer ${testToken}`);

        expect(response.statusCode).toEqual(400);
    });

    test("throws 400 for invalid zip code", async function () {
        DateValidation.validateDates.mockReturnValue(true);
        Distance.getDistance.mockReturnValue(9.8);

        const invalidZip = "00000";

        const testParams = new URLSearchParams({
            components: `postal_code:${invalidZip}|country:US`,
            key: GOOGLE_API_KEY,
        });

        fetchMock.get(`${GOOGLE_BASE_URL_GEOCODE}?${testParams}`, {
            status: 200,
            body: {
                "results": [],
                "status": "ZERO_RESULTS"
            }
        });

        const response = await request(app)
            .get("/concerts/")
            .query({ ...validRandomQuery, zipCode: "00000" })
            .set("authorization", `Bearer ${testToken}`);

        expect(response.statusCode).toEqual(400);
    });

    test("throws 401 for invalid token and invalid dates", async function () {
        DateValidation.validateDates.mockReturnValue(false);
        Distance.getDistance.mockReturnValue(9.8);

        const zipCodeParams = new URLSearchParams({
            components: `postal_code:80113|country:US`,
            key: GOOGLE_API_KEY,
        });

        fetchMock.get(`${GOOGLE_BASE_URL_GEOCODE}?${zipCodeParams}`, {
            status: 200,
            body: {
                "results": [{
                    "geometry": {
                        "location": {
                            "lat": 39.644843,
                            "lng": -104.968091
                        },
                    },
                }],
                "status": "OK"
            }
        });

        fetchMock.get(`${JAMBASE_BASE_URL}events?${concertParams}`, {
            status: 200,
            body: GET_CONCERTS_API_RESP,
        });

        const response = await request(app)
            .get("/concerts/")
            .query({ ...validRandomQuery, dateFrom: "2024-02-01", dateTo: "2024-01-01" })
            .set("authorization", `Bearer wrong`);

        expect(response.statusCode).toEqual(401);
    });

    test("throws 401 for invalid token and invalid zip code", async function () {
        DateValidation.validateDates.mockReturnValue(true);
        Distance.getDistance.mockReturnValue(9.8);

        const invalidZip = "00000";

        const testParams = new URLSearchParams({
            components: `postal_code:${invalidZip}|country:US`,
            key: GOOGLE_API_KEY,
        });

        fetchMock.get(`${GOOGLE_BASE_URL_GEOCODE}?${testParams}`, {
            status: 200,
            body: {
                "results": [],
                "status": "ZERO_RESULTS"
            }
        });

        const response = await request(app)
            .get("/concerts/")
            .query({ ...validRandomQuery, zipCode: "00000" })
            .set("authorization", `Bearer wrong`);

        expect(response.statusCode).toEqual(401);
    });

    // This test is last because it mocks a method the others test use unmocked.
    test("should return a concert with dates and zip code", async function () {
        DateValidation.validateDates.mockReturnValue(true);
        Distance.getDistance.mockReturnValue(9.8);

        const zipCodeParams = new URLSearchParams({
            components: `postal_code:80113|country:US`,
            key: GOOGLE_API_KEY,
        });

        fetchMock.get(`${GOOGLE_BASE_URL_GEOCODE}?${zipCodeParams}`, {
            status: 200,
            body: {
                "results": [{
                    "geometry": {
                        "location": {
                            "lat": 39.644843,
                            "lng": -104.968091
                        },
                    },
                }],
                "status": "OK"
            }
        });

        // Normally getConcerts returns formatted concerts. For ease of testing,
        // mocking to return raw data.
        Concert.getConcerts = jest.fn();
        Concert.getConcerts.mockReturnValue(GET_CONCERTS_API_RESP);

        const spySampleLodash = jest.spyOn(_, 'sample');

        const response = await request(app)
            .get("/concerts/random")
            .query({
                dateFrom: "2024-01-01",
                dateTo: "2024-01-02",
                zipCode: 80113,
            })
            .set("authorization", `Bearer ${testToken}`);

        expect(spySampleLodash).toHaveBeenCalledWith(GET_CONCERTS_API_RESP);
    });
});


afterAll(async function () {
    await db.end();
});