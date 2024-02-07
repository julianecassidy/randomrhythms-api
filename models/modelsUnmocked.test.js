"use strict";

// REAL VERSION. RUNNING THESE TESTS COUNTS AGAINST OUR API LIMIT

process.env.NODE_ENV = "test";

const db = require("../db");
const bcrypt = require("bcrypt");

const fetchMock = require("fetch-mock");

const _ = require("lodash");
const spySampleLodash = jest.spyOn(_, 'sample');

const { JAMBASE_API_KEY } = require("../config");
const { User } = require("./user");
const { Concert, JAMBASE_BASE_URL } = require("./concert");
const { GET_CONCERTS_API_RESP, GET_CONCERT_API_RESP } = require("./_testCommon");
const { NotFoundError, BadRequestError } = require("../helpers/expressError");

beforeAll(async function () {
    await db.query("DELETE FROM users");
})

beforeEach(async function () {

    jest.clearAllMocks();

    await db.query("BEGIN");

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

afterEach(async function () {
    await db.query("ROLLBACK");
})

/************************************************************** CONCERT CLASS */
// REAL VERSION. RUNNING THESE TESTS COUNTS AGAINST OUR API LIMIT

describe("getConcerts", function () {
    
    // TODO: This test can only check future dates, but going far enough out for
    // the test to work but close enough that we have concert data to test is
    // proving troublesome.
    // If this app is in use at the end of 2024, the dates of this test will
    // need to be moved forwards.
    test("returns a list of concerts data", async function () {
        const resp = await Concert.getConcerts({
            dateFrom: "2024-03-01", 
            dateTo: "2024-03-02", 
            lat: 39.644843, 
            lng: -104.968091,
            geoRadius: 5,
        });

        expect(resp).toEqual(expect.arrayContaining([{
                jambaseId: expect.any(String),
                headliner: {
                    name: expect.any(String),
                    bandImageUrl: expect.any(String),
                    genres: expect.any(Array)
                },
                openers: expect.any(Array),
                venue: {
                    name: expect.any(String),
                    venueImageUrl: expect.any(String),
                    streetAddress: expect.any(String),
                    city: expect.any(String),
                    state: "CO",
                    zipCode: expect.any(String)
                },
                cost: expect.any(String),
                dateTime: expect.any(String),
                ticketUrl: expect.any(String),
                eventStatus: expect.any(String)
        }]));
    });

    // If this app is in use at the end of 2024, the dates of this test will
    // need to be moved forwards.
    // test("returns an empty list if no matching concerts", async function () {
    //     const resp = await Concert.getConcerts({
    //         dateFrom: "2025-01-01", 
    //         dateTo: "2025-01-01", 
    //         lat: 39.644843, 
    //         lng: -104.968091,
    //         geoRadius: 1,
    // });

    //     expect(resp).toEqual([]);
    // });

    // test("throw 400 if API call fails", async function () {
    //     try {
    //         await Concert.getConcerts(
    //             "2024-01-01", 
    //             "2024-01-02", 
    //             39.644843, 
    //             -104.968091,
    //             10
    //         );
    //         throw new Error("fail test, you shouldn't get here");
    //     } catch (err) {
    //         expect(err instanceof BadRequestError).toBeTruthy();
    //     }
    // });
});


// describe("getConcertDetails", function () {

//     // TODO: Concerts in the past do not have offers, causing an error when
//     // accessing data for cost and ticket url. I don't want to remove those
//     // requirements as this app is not for concert history. This test will need
//     // to be refactored.
//     // test("returns a concert", async function () {

//     //     const resp = await Concert.getConcertDetails("11070750");

//     //     expect(resp).toEqual({
//     //         jambaseId: "jambase:11070750",
//     //         headliner: {
//     //             name: "Ben Rector",
//     //             band_image,_url: "https://www.jambase.com/wp-content/uploads/2023/01/ben-rector-1480x832.png", 
//     //             genres: ["folk", "indie", "pop", "rock" ]
//     //         },
//     //         openers: ["Cody Fry"],
//     //         venue: {
//     //             name: "Boettcher Concert Hall",
//     //             venueImageUrl: "",
//     //             streetAddress: "1400 Curtis Street",
//     //             city: "Denver",
//     //             state: "CO",
//     //             zipCode: "80202"
//     //         },
//     //         // NOTE: there are no available prices once a concert has passsed
//     //         cost: undefined, 
//     //         dateTime: "2024-02-01T19:30:00",
//     //         // NOTE: there are no available ticket links once a concert has passed
//     //         ticketUrl: undefined,
//     //         eventStatus: "scheduled"
//     //     });
//     // });

//     test("throw 404 if no such concert", async function () {
//         try {
//             await Concert.getConcertDetails("not-a-concert");
//             throw new Error("fail test, you shouldn't get here");
//         } catch (err) {
//             expect(err instanceof NotFoundError).toBeTruthy();
//         }
//     });

//     // TODO: find some way to make the API request fail for this test
//     // test("throw 400 if API request fails", async function () {
//     //     try {
//     //         await Concert.get("not-a-concert");
//     //         throw new Error("fail test, you shouldn't get here");
//     //     } catch (err) {
//     //         expect(err instanceof BadRequestError).toBeTruthy();
//     //     }
//     // });
// });


// describe("getRandomConcertDetails", function () {
//     test("returns a concert with all filters", async function () {
//         const resp = await Concert.getRandomConcertDetails(
//             "2025-02-01", 
//             "2025-02-02", 
//             39.644843, 
//             -104.968091,
//             10,
//             30
//         );

//         expect(spySampleLodash).toHaveBeenCalled();
//     });

//     test("returns a concert without price filter", async function () {
//         const resp = await Concert.getRandomConcertDetails(
//             "2025-02-01", 
//             "2025-02-02", 
//             39.644843, 
//             -104.968091,
//             10,
//             );
            
//         expect(spySampleLodash).toHaveBeenCalled();
//     });

//     // If this app is in use in 2026, the dates of this test should probably be
//     // moved forwards.
//     test("returns empty object for no matches", async function () {
//         const resp = await Concert.getRandomConcertDetails(
//             "2027-01-01", 
//             "2027-01-02", 
//             39.644843, 
//             -104.968091,
//             10,
//             10
//         );

//         expect(resp).toEqual([]);
//     });
// });


// describe("test getPrices", function () {
//     test("returns price", async function () {

//     });

//     test("returns empty string if price not found", async function () {

//     });
// });


afterAll(async function () {
    await db.end();
});