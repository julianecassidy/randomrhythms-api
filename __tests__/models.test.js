"use strict";

process.env.NODE_ENV = "test";

const db = require("../db");
const bcrypt = require("bcrypt");

const AxiosMockAdapter = require("axios-mock-adapter");
const axios = require("axios");
const axiosMock = new AxiosMockAdapter(axios);

const { JAMBASE_API_KEY } = require("../config");
const User = require("../models/user");
const { Concert, JAMBASE_BASE_URL } = require("../models/concert");
const { GET_CONCERTS_API_RESP, GET_CONCERT_API_RESP } = require("./concertData");
const { UnauthorizedError, BadRequestError } = require("../helpers/expressError");

beforeAll(async function () {
    await db.query("DELETE FROM users");
})

beforeEach(async function () {

    await db.query("BEGIN");

    async function _hashedPwd(password) {
        return await bcrypt.hash(password, 1);
    }

    const testUser = ["Test", "test@test.com", await _hashedPwd(testPassword)];

    await db.query(
        `INSERT INTO users
             VALUES ($1, $2, $3, $4)`,
        testUser
    );
});

afterEach(async function () {
    await db.query("ROLLBACK");
})


/***************************************************************** USER CLASS */
describe("validateSignUpCode", function () {
    const testCode = "welcome";

    test("returns true for valid code", function () {
        expect(validateSignUpCode("welcome", testCode)).toBe(true);
    });

    test("returns false for invalid code", function () {
        expect(validateSignUpCode("wrong", testCode)).toBe(false);
    });

})

describe("register", function () {
    const newUser = {
        password: "password",
        name: "New",
        email: "new@test.com",
    };

    test("can register", async function () {
        const user = await User.register({
            ...newUser
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
            });
            throw new Error("fail test, you shouldn't get here");
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });

    test("throw 400 for duplicate email", async function () {
        try {
            const user = await User.register({
                password: "password",
                name: "TestF",
                email: "test@test.com",
            });
            throw new Error("fail test, you shouldn't get here");
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });
});

describe("login", function () {
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
})


/************************************************************** CONCERT CLASS */
// MOCKED VERSIONS. RUN WITHOUT RESTRAINT.

describe("getConcerts", function () {
    
    test("returns a list of concerts data", async function () {
        axiosMock.onGet(`${JAMBASE_BASE_URL}/events`, { 
            params: {
                apikey: JAMBASE_API_KEY,
                eventDateFrom: "2024-01-01",
                eventDateTo: "2024-01-02",
                geoLatitude: 39.644843,
                geoLongitude: -104.968091,
                geoRadiusAmount: 5,
                geoRadiusUnits: mi
            }
        }).reply(200, {
            "results": GET_CONCERT_API_RESP
        });

        const resp = await Concert.getConcerts(
            "2024-01-01", 
            "2024-01-02", 
            39.644843, 
            -104.968091,
            5
        );

        expect(resp).toEqual([{
            jambase_id: "jambase:11070750",
            headliner: {
                name: "Ben Rector",
                band_image,_url: "https://www.jambase.com/wp-content/uploads/2023/01/ben-rector-1480x832.png", 
                genres: ["folk", "indie", "pop", "rock" ]
            },
            openers: ["Cody Fry"],
            venue: {
                name: "Boettcher Concert Hall",
                venue_image_url: "",
                streetAddress: "1400 Curtis Street",
                city: "Denver",
                state: "CO",
                zipCode: "80202"
            },
            cost: "",
            date_time: "2024-02-01T19:30:00",
            ticket_url: "https://coloradosymphony.org/?utm_source=jambase",
            event_status: "scheduled"
        }, {
            jambase_id: "jambase:11297801",
            headliner: {
                name: "Silent Planet",
                band_image,_url: "https://www.jambase.com/wp-content/uploads/2017/04/silent-planet-silent-planet-0ddd54a3-9fb1-4314-a48d-8ace7dafd1a7_279581_TABLET_LANDSCAPE_LARGE_16_9-1480x832.jpg", 
                genres: ["metal", "punk"]
            },
            openers: ["Thornhill", "Aviana", "Johnny Booth"],
            venue: {
                name: "Summit Music Hall",
                venue_image_url: "",
                streetAddress: "1902 Blake St",
                city: "Denver",
                state: "CO",
                zipCode: "80202"
            },
            cost: "22.00",
            date_time: "2024-02-01T18:00:00",
            ticket_url: "https://ticketmaster.evyy.net/c/252938/264167/4272?u=https%3A%2F%2Fconcerts.livenation.com%2Fsilent-planet-denver-colorado-02-01-2024%2Fevent%2F1E005F6E984C10F1",
            event_status: "scheduled"
        }]);
    });

    test("returns an empty list if no matching concerts", async function () {
        axiosMock.onGet(`${JAMBASE_BASE_URL}/events`, { 
            params: {
                apikey: JAMBASE_API_KEY,
                eventDateFrom: "2024-01-01",
                eventDateTo: "2024-01-02",
                geoLatitude: 39.644843,
                geoLongitude: -104.968091,
                geoRadiusAmount: 1,
                geoRadiusUnits: mi
            }
        }).reply(200, {
            "results": []
        });

        const resp = await Concert.getConcerts(
            "2024-01-01", 
            "2024-01-02", 
            39.644843, 
            -104.968091,
            1
        );

        expect(resp).toEqual([]);

    });

    test("throw 400 if API call fails", async function () {
        axiosMock.onGet(`${JAMBASE_BASE_URL}/events`, { 
            params: {
                apikey: JAMBASE_API_KEY,
                eventDateFrom: "2024-01-01",
                eventDateTo: "2024-01-02",
                geoLatitude: 39.644843,
                geoLongitude: -104.968091,
                geoRadiusAmount: 10,
                geoRadiusUnits: mi
            }
        }).reply(400, {
            "results":  {"success": false}
        });

        try {
            await Concert.getConcerts(
                "2024-01-01", 
                "2024-01-02", 
                39.644843, 
                -104.968091,
                10
            );
            throw new Error("fail test, you shouldn't get here");
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });
});


describe("getConcertDetails", function () {
    test("returns a concert", async function () {
        axiosMock.onGet(`${JAMBASE_BASE_URL}/events/id/jambase:123`, { 
            params: {
                apikey: JAMBASE_API_KEY,
            }
        }).reply(200, {
            "results":  GET_CONCERTS_API_RESP
        });

        const resp = await Concert.getConcert("123");

        expcet(resp).toEqual({
            jambase_id: "jambase:11070750",
            headliner: {
                name: "Ben Rector",
                band_image,_url: "https://www.jambase.com/wp-content/uploads/2023/01/ben-rector-1480x832.png", 
                genres: ["folk", "indie", "pop", "rock" ]
            },
            openers: ["Cody Fry"],
            venue: {
                name: "Boettcher Concert Hall",
                venue_image_url: "",
                streetAddress: "1400 Curtis Street",
                city: "Denver",
                state: "CO",
                zipCode: "80202"
            },
            cost: "",
            date_time: "2024-02-01T19:30:00",
            ticket_url: "https://coloradosymphony.org/?utm_source=jambase",
            event_status: "scheduled"
        });
    });

    test("throw 404 if no such concert", async function () {
        axiosMock.onGet(`${JAMBASE_BASE_URL}/events/id/jambase:not-a-concert`, { 
            params: {
                apikey: JAMBASE_API_KEY,
            }
        }).reply(400, {
            "results": {
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
            await Concert.get("not-a-concert");
            throw new Error("fail test, you shouldn't get here");
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });

    test("throw 400 if API request fails", async function () {
        axiosMock.onGet(`${JAMBASE_BASE_URL}/events/id/jambase:not-a-concert`, { 
            params: {
                apikey: JAMBASE_API_KEY,
            }
        }).reply(400, {
            "results": {
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
            await Concert.get("not-a-concert");
            throw new Error("fail test, you shouldn't get here");
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });
});


describe("getRandomConcertDetails", function () {
    test("returns a concert with all filters", async function () {

    });

    test("returns a concert without price filter", async function () {
        
    });

    test("returns empty object for no matches", async function () {
        
    });
});


// describe("test getPrices", function () {
//     test("returns price", async function () {

//     });

//     test("returns empty string if price not found", async function () {

//     });
// });


afterAll(async function () {
    await db.end();
});