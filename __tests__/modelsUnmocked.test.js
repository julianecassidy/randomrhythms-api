"use strict";

// REAL VERSION. RUNNING THESE TESTS COUNTS AGAINST OUR API LIMIT

process.env.NODE_ENV = "test";

const db = require("../db");
const bcrypt = require("bcrypt");

const axios = require("axios");

const _sample = require("lodash");
const spySampleLodash = jest.spyOn(_, 'sample');

const { JAMBASE_API_KEY } = require("../config");
const { User } = require("../models/user");
const { Concert, JAMBASE_BASE_URL } = require("../models/concert");
const { GET_CONCERTS_API_RESP, GET_CONCERT_API_RESP } = require("./concertData");
const { UnauthorizedError, BadRequestError } = require("../helpers/expressError");

beforeAll(async function () {
    await db.query("DELETE FROM users");
})

beforeEach(async function () {

    jest.clearAllMocks();

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

/************************************************************** CONCERT CLASS */
// REAL VERSION. RUNNING THESE TESTS COUNTS AGAINST OUR API LIMIT

describe("getConcerts", function () {
    
    // TODO: This test can only check future dates, but going far enough out for
    // the test to work but close enough that we have concert data to test is
    // proving troublesome.
    // test("returns a list of concerts data", async function () {
    //     const resp = await Concert.getConcerts(
    //         "2024-01-01", 
    //         "2024-01-02", 
    //         39.644843, 
    //         -104.968091,
    //         5
    //     );
    // });

    // If this app is in use in 2026, the dates of this test should probably be
    // moved forwards.
    test("returns an empty list if no matching concerts", async function () {
        const resp = await Concert.getConcerts(
            "2027-01-01", 
            "2027-01-01", 
            39.644843, 
            -104.968091,
            1
        );

        expect(resp).toEqual([]);
    });

    test("throw 400 if API call fails", async function () {
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

        const resp = await Concert.getConcert("11070750");

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
        try {
            await Concert.get("not-a-concert");
            throw new Error("fail test, you shouldn't get here");
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });

    // TODO: find some way to make the API request fail for this test
    // test("throw 400 if API request fails", async function () {
    //     try {
    //         await Concert.get("not-a-concert");
    //         throw new Error("fail test, you shouldn't get here");
    //     } catch (err) {
    //         expect(err instanceof BadRequestError).toBeTruthy();
    //     }
    // });
});


describe("getRandomConcertDetails", function () {
    test("returns a concert with all filters", async function () {
        const resp = await Concert.getRandomConcert(
            "2025-02-01", 
            "2025-02-02", 
            39.644843, 
            -104.968091,
            10,
            30
        );

        expect(spySampleLodash).toHaveBeenCalled();
    });

    test("returns a concert without price filter", async function () {
        const resp = await Concert.getRandomConcert(
            "2025-02-01", 
            "2025-02-02", 
            39.644843, 
            -104.968091,
            10,
            );
            
        expect(spySampleLodash).toHaveBeenCalled();
    });

    // If this app is in use in 2026, the dates of this test should probably be
    // moved forwards.
    test("returns empty object for no matches", async function () {
        const resp = await Concert.getRandomConcert(
            "2027-01-01", 
            "2027-01-02", 
            39.644843, 
            -104.968091,
            10,
            10
        );

        expect(resp).toEqual([]);
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