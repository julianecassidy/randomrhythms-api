"use strict";

process.env.NODE_ENV = "test";
process.env.SIGN_UP_CODE = "test_code";

const db = require("../db");
const bcrypt = require("bcrypt");

const fetchMock = require("fetch-mock");

const _ = require("lodash");

const { JAMBASE_API_KEY } = require("../config");
const { User } = require("./user");
const { Concert, JAMBASE_BASE_URL } = require("./concert");
const { Distance } = require("../helpers/getDistance");
const { GET_CONCERTS_API_RESP, GET_CONCERT_API_RESP } = require("./_testCommon");
const {
    UnauthorizedError,
    BadRequestError,
    NotFoundError } = require("../helpers/expressError");

beforeAll(async function () {
    await db.query("DELETE FROM users");

    async function _hashedPwd(password) {
        return await bcrypt.hash(password, 1);
    }

    const testUserData = ["Test", "test@test.com", await _hashedPwd("password")];

    const result = await db.query(
        `INSERT INTO users (name, email, password)
             VALUES ($1, $2, $3)
        RETURNING id, email, name`,
        testUserData);

    const testUser = result.rows[0];
});

beforeEach(async function () {

    fetchMock.reset();
    jest.clearAllMocks();
    Distance.getDistance = jest.fn();

    await db.query("BEGIN");
});

afterEach(async function () {
    await db.query("ROLLBACK");
});


/***************************************************************** USER CLASS */
describe("validateSignUpCode", function () {
    const testCode = "test_code";

    test("returns true for valid code", function () {
        expect(User.validateSignUpCode("test_code", testCode)).toBe(true);
    });

    test("returns false for invalid code", function () {
        expect(User.validateSignUpCode("wrong", testCode)).toBe(false);
    });

});

describe("register", function () {
    const newUser = {
        password: "password",
        name: "New",
        email: "new@test.com",
    };

    test("can register", async function () {
        const user = await User.register({
            ...newUser, signupCode: "test_code"
        });

        expect(user).toEqual({
            name: "New",
            email: "new@test.com",
            id: expect.any(Number),
        });
    });

    test("throw 400 for bad data", async function () {
        try {
            const user = await User.register({
                password: "password",
                first_name: "TestF",
                signupCode: "test_code",
            });
            throw new Error("fail test, you shouldn't get here");
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });

    test("throw 400 for bad sign up code", async function () {
        try {
            const user = await User.register({
                ...newUser, signupCode: "wrong"
            });
            throw new Error("fail test, you shouldn't get here");
        } catch (err) {
            expect(err instanceof UnauthorizedError).toBeTruthy();
        }
    });

    test("throw 400 for duplicate email", async function () {
        try {
            const user = await User.register({
                password: "password",
                name: "TestF",
                email: "test@test.com",
                signupCode: "test_code",
            });
            throw new Error("fail test, you shouldn't get here");
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });
});

describe("authenticate", function () {
    test("works with correct credentials", async function () {
        const user = await User.authenticate("test@test.com", "password");
        expect(user).toEqual({
            name: "Test",
            email: "test@test.com",
            id: expect.any(Number),
        });
    });

    test("throws 401 if no such user", async function () {
        try {
            await User.authenticate("not-a-user", "password");
            throw new Error("fail test, you shouldn't get here");
        } catch (err) {
            expect(err instanceof UnauthorizedError).toBeTruthy();
        }
    });

    test("throws 401 if wrong password", async function () {
        try {
            await User.authenticate("test@test.com", "wrong");
            throw new Error("fail test, you shouldn't get here");
        } catch (err) {
            expect(err instanceof UnauthorizedError).toBeTruthy();
        }
    });
});


/************************************************************** CONCERT CLASS */
// MOCKED VERSIONS. RUN WITHOUT RESTRAINT.

describe("getConcerts", function () {

    test("returns a list of concerts data", async function () {
        const params = new URLSearchParams({
            eventDateFrom: "2024-01-01",
            eventDateTo: "2024-01-02",
            geoLatitude: 39.644843,
            geoLongitude: -104.968091,
            geoRadiusAmount: 5,
            geoRadiusUnits: "mi",
            apikey: JAMBASE_API_KEY,
        });

        fetchMock.get(`${JAMBASE_BASE_URL}events?${params}`, {
            status: 200,
            body: GET_CONCERTS_API_RESP,
        });

        Distance.getDistance.mockReturnValue(5);

        const resp = await Concert.getConcerts({
            dateFrom: "2024-01-01",
            dateTo: "2024-01-02",
            lat: 39.644843,
            lng: -104.968091,
            geoRadius: 5,
        });

        expect(resp).toEqual([{
            id: "jambase:11070750",
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
                distance: 5
            },
            cost: "",
            dateTime: "2024-02-01T19:30:00",
            ticketUrl: "https://coloradosymphony.org/?utm_source=jambase",
            eventStatus: "scheduled",
            eventSource: "jambase"
        }, {
            id: "jambase:11297801",
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
                distance: 5
            },
            cost: "22.00",
            dateTime: "2024-02-01T18:00:00",
            ticketUrl: "https://ticketmaster.evyy.net/c/252938/264167/4272?u=https%3A%2F%2Fconcerts.livenation.com%2Fsilent-planet-denver-colorado-02-01-2024%2Fevent%2F1E005F6E984C10F1",
            eventStatus: "scheduled",
            eventSource: "jambase",
        }]);
    });

    test("returns an empty list if no matching concerts", async function () {
        const params = new URLSearchParams({
            eventDateFrom: "2024-01-01",
            eventDateTo: "2024-01-02",
            geoLatitude: 39.644843,
            geoLongitude: -104.968091,
            geoRadiusAmount: 1,
            geoRadiusUnits: "mi",
            apikey: JAMBASE_API_KEY,
        });

        fetchMock.get(`${JAMBASE_BASE_URL}events?${params}`, {
            status: 200,
            body: {
                "success": true,
                "pagination": {
                    "page": 1,
                    "perPage": 40,
                    "totalItems": 0,
                    "totalPages": 1,
                    "nextPage": null,
                    "previousPage": null
                },
                "events": []
            },
        });

        const resp = await Concert.getConcerts({
            dateFrom: "2024-01-01",
            dateTo: "2024-01-02",
            lat: 39.644843,
            lng: -104.968091,
            geoRadius: 1,
        });

        expect(resp).toEqual([]);
    });

    test("throw 400 if API call fails", async function () {
        const params = new URLSearchParams({
            eventDateFrom: "2024-01-01",
            eventDateTo: "2024-01-02",
            geoLatitude: 39.644843,
            geoLongitude: -104.968091,
            geoRadiusAmount: 10,
            geoRadiusUnits: "mi",
            apikey: JAMBASE_API_KEY,
        });

        fetchMock.get(`${JAMBASE_BASE_URL}events?${params}`, {
            status: 400,
            body: { "success": false },
        });

        try {
            await Concert.getConcerts({
                dateFrom: "2024-01-01",
                dateTo: "2024-01-02",
                lat: 39.644843,
                lng: -104.968091,
                geoRadius: 10,
            });
            throw new Error("fail test, you shouldn't get here");
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });
});


describe("formatConcertData", function () {
    test("formats data", async function () {
        const rawConcertData = GET_CONCERTS_API_RESP.events[0];
        const lat = 39.644843;
        const lng = -104.968091;

        Distance.getDistance.mockReturnValue(9.8);

        const response = await Concert.formatConcertData(rawConcertData, lat, lng);

        expect(response).toEqual({
            id: "jambase:11070750",
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
        });
    });
});


describe("getConcertDetails", function () {

    test("returns a concert", async function () {
        const testConcertId = "jambase:123";

        fetchMock.get(
            `${JAMBASE_BASE_URL}events/id/${testConcertId}?apikey=${JAMBASE_API_KEY}`, {
            status: 200,
            body: GET_CONCERT_API_RESP
        });

        const resp = await Concert.getConcertDetails(testConcertId);

        expect(resp).toEqual({
            id: "jambase:11070750",
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
                distance: null
            },
            cost: "",
            dateTime: "2024-02-01T19:30:00",
            ticketUrl: "https://coloradosymphony.org/?utm_source=jambase",
            eventStatus: "scheduled",
            eventSource: "jambase"
        });
    });

    test("throw 404 if no such concert", async function () {
        const invalidConcertId = "not-a-concert";

        fetchMock.get(
            `${JAMBASE_BASE_URL}events/id/${invalidConcertId}?apikey=${JAMBASE_API_KEY}`, {
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

        try {
            await Concert.getConcertDetails(invalidConcertId);
            throw new Error("fail test, you shouldn't get here");
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });

    test("throw 400 if API request fails", async function () {
        fetchMock.get(
            `${JAMBASE_BASE_URL}events/id/undefined?apikey=${JAMBASE_API_KEY}`, {
            status: 400,
            body: {
                "success": false,
                "errors": [
                    {
                        "code": "bad_request",
                        "message": "No idea what this is going to be"
                    }
                ]
            }
        });

        try {
            await Concert.getConcertDetails();
            throw new Error("fail test, you shouldn't get here");
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });
});


describe("getRandomConcertDetails", function () {
    test("returns a concert with all filters", async function () {
        const params = new URLSearchParams({
            eventDateFrom: "2024-01-01",
            eventDateTo: "2024-01-02",
            geoLatitude: 39.644843,
            geoLongitude: -104.968091,
            geoRadiusAmount: 10,
            geoRadiusUnits: "mi",
            apikey: JAMBASE_API_KEY,
        });

        fetchMock.get(`${JAMBASE_BASE_URL}events?${params}`, {
            status: 200,
            body: GET_CONCERTS_API_RESP,
        });

        Distance.getDistance.mockReturnValue(5);

        const resp = await Concert.getRandomConcertDetails({
            dateFrom: "2024-01-01",
            dateTo: "2024-01-02",
            lat: 39.644843,
            lng: -104.968091,
            geoRadius: 10,
            price: 30,
        });

        expect(resp).toEqual({
            id: "jambase:11297801",
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
                distance: 5
            },
            cost: "22.00",
            dateTime: "2024-02-01T18:00:00",
            ticketUrl: "https://ticketmaster.evyy.net/c/252938/264167/4272?u=https%3A%2F%2Fconcerts.livenation.com%2Fsilent-planet-denver-colorado-02-01-2024%2Fevent%2F1E005F6E984C10F1",
            eventStatus: "scheduled",
            eventSource: "jambase"
        });
    });

    test("returns empty object for no matches", async function () {

        const params = new URLSearchParams({
            eventDateFrom: "2024-01-01",
            eventDateTo: "2024-01-02",
            geoLatitude: 39.644843,
            geoLongitude: -104.968091,
            geoRadiusAmount: 10,
            geoRadiusUnits: "mi",
            apikey: JAMBASE_API_KEY,
        });

        fetchMock.get(`${JAMBASE_BASE_URL}events?${params}`, {
            status: 200,
            body: GET_CONCERTS_API_RESP
        });

        const resp = await Concert.getRandomConcertDetails({
            dateFrom: "2024-01-01",
            dateTo: "2024-01-02",
            lat: 39.644843,
            lng: -104.968091,
            geoRadius: 10,
            price: 10,
        });

        expect(resp).toEqual([]);
    });

    // This test is last because it mocks a method the others test use unmocked.
    test("returns a concert without price filter", async function () {
        // Normally getConcerts returns formatted concerts. For ease of testing,
        // mocking to return raw data.
        Concert.getConcerts = jest.fn();
        Concert.getConcerts.mockReturnValue(GET_CONCERTS_API_RESP);

        const spySampleLodash = jest.spyOn(_, 'sample');

        const resp = await Concert.getRandomConcertDetails({
            dateFrom: "2024-01-01",
            dateTo: "2024-01-02",
            lat: 39.644843,
            lng: -104.968091,
            geoRadius: 10,
        });

        expect(spySampleLodash).toHaveBeenCalledWith(GET_CONCERTS_API_RESP);
    });
});


// describe("test getPrices", function () {
//     test("returns price", async function () {

//     });

//     test("returns empty string if price not found", async function () {

//     });
// });


afterAll(async function () {
    jest.clearAllMocks();
    await db.end();
});