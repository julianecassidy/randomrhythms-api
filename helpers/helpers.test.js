"use strict";

const fetchMock = require("fetch-mock");
const jwt = require("jsonwebtoken");

const { GOOGLE_API_KEY, SECRET_KEY } = require("../config");

const { convertZipCodeToCoords, GOOGLE_BASE_URL } = require("./zipToCoords");
const { validateDates } = require("./validators");
const { createToken } = require("./token.js");
const { BadRequestError } = require("./expressError");


// REAL VERSION. RUNNING THIS TEST COUNTS AGAINST OUR API LIMIT
// describe("convertZipCodeToCoords", function () {
//     test("converts valid zip code to lat and long", async function () {
//         console.log("testing convertZipCodeToCoords; calling API")
//         const location = await convertZipCodeToCoords(80113);

//         expect(location.lat).toEqual(39.6448429);
//         expect(location.lng).toEqual(-104.9680914);
//     });

//     test("throws 400 for invalid zip code", async function () {
//         console.log("testing convertZipCodeToCoords; calling API")
//         try {
//             await convertZipCodeToCoords("invalid_zip");
//             throw new Error("fail test, you shouldn't get here");
//         } catch (err) {
//             expect(err instanceof BadRequestError).toBeTruthy();
//         }
//     });
// });


// MOCKED VERSION. RUN WITHOUT RESTRAINT.
describe("convertZipCodeToCoords", function () {
    const validZip = 80113;

    test("converts valid zip code to lat and long", async function () {
        const testParams = new URLSearchParams({
            components: `postal_code:${validZip}|country:US`,
            key: GOOGLE_API_KEY,
        });

        fetchMock.reset();

        fetchMock.get(`${GOOGLE_BASE_URL}?${testParams}`, {
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

        const location = await convertZipCodeToCoords(validZip);

        expect(location.lat).toEqual(39.644843);
        expect(location.lng).toEqual(-104.968091);
    });

    test("throws 400 for invalid zip code", async function () {
        fetchMock.reset();

        const invalidZip = "00000";

        const testParams = new URLSearchParams({
            components: `postal_code:${invalidZip}|country:US`,
            key: GOOGLE_API_KEY,
        });

        fetchMock.get(`${GOOGLE_BASE_URL}?${testParams}`, {
            status: 200,
            body: {
                "results": [],
                "status": "ZERO_RESULTS"
            }
        });

        try {
            await convertZipCodeToCoords(invalidZip);
            throw new Error("fail test, you shouldn't get here");
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });

    test("throws 400 for other API errors", async function () {
        fetchMock.reset();

        const validZip = "80113";

        const testParams = new URLSearchParams({
            components: `postal_code:${validZip}|country:US`,
            key: GOOGLE_API_KEY,
        });

        fetchMock.get(`${GOOGLE_BASE_URL}?${testParams}`, {
            status: 200,
            body: {
                "results": [],
                "status": "OVER_DAILY_LIMIT"
            }
        });

        try {
            await convertZipCodeToCoords("80113");
            throw new Error("fail test, you shouldn't get here");
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });
});


// NOTE: dates in this test will need to be updated after 2025-12-01
describe("checks from date before to date", function () {
    test("true for valid dates", function () {
        expect(validateDates("2025-01-01", "2025-01-02")).toEqual(true);
        expect(validateDates("2024-09-01", "2025-01-31")).toEqual(true);
        expect(validateDates("2025-01-01", "2025-01-01")).toEqual(true);
    });

    test("false for invalid dates", function () {
        expect(validateDates("2024-12-01", "2024-11-02")).toEqual(false);
        expect(validateDates("2024-12-02", "2024-12-01")).toEqual(false);
        expect(validateDates("2025-01-01", "2024-12-02")).toEqual(false);
        expect(validateDates("2024-01-01", "2024-12-01")).toEqual(false);
        expect(validateDates("2025-12-01", "2025-12-04")).toEqual(false);
        expect(validateDates("2024-12-01", "2025-12-01")).toEqual(false);

    });
});


describe("createToken", function () {
    test("works", function () {
        const token = createToken({ id: "123", email: "test@test.com", name: "Test" });
        const payload = jwt.verify(token, SECRET_KEY);
        expect(payload).toEqual({
            iat: expect.any(Number),
            id: "123",
            email: "test@test.com",
            name: "Test",
        });
    });
});
