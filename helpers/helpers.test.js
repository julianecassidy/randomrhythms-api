"use strict";

const fetchMock = require("fetch-mock");
const jwt = require("jsonwebtoken");
const dayjs = require('dayjs');

const { GOOGLE_API_KEY, SECRET_KEY } = require("../config");

const { convertZipCodeToCoords, GOOGLE_BASE_URL } = require("./zipToCoords");
const { DateValidation } = require("./validators");
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
        fetchMock.reset();

        const testParams = new URLSearchParams({
            components: `postal_code:${validZip}|country:US`,
            key: GOOGLE_API_KEY,
        });

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


// REAL VERSION. RUNNING THIS TEST COUNTS AGAINST OUR API LIMIT
// describe("getDistance", function () {
//     test("returns distance for valid origin and destination", async function () {
//         console.log("testing getDistance; calling API")
//         const distance = await getDistance(
//             39.644843,
//             -104.968091,
//             "1400 Curtis Street",
//             "Denver",
//             "CO",
//             "80204"
//         );

//         expect(distance).toEqual(9.8);
//     });

//     test("throws 400 for invalid destination", async function () {
//         console.log("testing getDistance; calling API")
//         try {
//             await getDistance(
//                 39.644843,
//                 -104.968091,
//                 "not",
//                 "a",
//                 "valid",
//                 "destination");
//             throw new Error("fail test, you shouldn't get here");
//         } catch (err) {
//             expect(err instanceof BadRequestError).toBeTruthy();
//         }
//     });

//     test("throws 400 for invalid origin", async function () {
//         console.log("testing getDistance; calling API")
//         try {
//             await getDistance(
//                 "not-a-coord",
//                 -104.968091,
//                 "1400 Curtis Street",
//                 "Denver",
//                 "CO",
//                 "80204");
//             throw new Error("fail test, you shouldn't get here");
//         } catch (err) {
//             expect(err instanceof BadRequestError).toBeTruthy();
//         }
//     });
// });


// MOCKED VERSION. RUN WITHOUT RESTRAINT.
describe("gets distance from venue to zip code", function () {

    test("returns distance for valid origin and destination", async function () {
        fetchMock.reset();

        const testParams = new URLSearchParams({
            origins: "39.644843,-104.968091",
            destinations: "1400 Curtis Street, Denver, CO 80202",
            units: "imperial",
            key: GOOGLE_API_KEY,
        });

        fetchMock.get(`${GOOGLE_BASE_URL}?${testParams}`, {
            status: 200,
            body: {
                "destination_addresses": [
                    "1400 Curtis Street, Denver, CO 80204, USA"
                ],
                "origin_addresses": [
                    "20 Cherry Hills Dr, Englewood, CO 80113, USA"
                ],
                "rows": [{
                    "elements": [{
					"distance": {
						"text": "9.8 mi",
						"value": 15771
					},
					"duration": {
						"text": "21 mins",
						"value": 123,
                    },
                    "status": "OK"
                    }],
                }],
                "status": "OK"
            }
        });

        const distance = await getDistance(
            39.644843,
            -104.968091,
            "1400 Curtis Street",
            "Denver",
            "CO",
            "80204"
        );

        expect(distance).toEqual(9.8);
    });

    test("throws 400 for invalid destination", async function () {
        fetchMock.reset();

        const testParams = new URLSearchParams({
            origins: "not-a-coord,-104.968091",
            destinations: "1400 Curtis Street, Denver, CO 80202",
            units: "imperial",
            key: GOOGLE_API_KEY,
        });

        fetchMock.get(`${GOOGLE_BASE_URL}?${testParams}`, {
            status: 200,
            body: {
                "destination_addresses": [
                    ""
                ],
                "origin_addresses": [
                    ""
                ],
                "rows": [{
                    "elements": [{
                        "status": "NOT_FOUND"
                    }]
                }],
                "status": "OK"
            }
        });

        try {
            await getDistance(
                39.644843,
                -104.968091,
                "not",
                "a",
                "valid",
                "destination");
            throw new Error("fail test, you shouldn't get here");
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });

    test("throws 400 for invalid origin", async function () {
        fetchMock.reset();

        const testParams = new URLSearchParams({
            origins: "not-a-coord,-104.968091",
            destinations: "1400 Curtis Street, Denver, CO 80202",
            units: "imperial",
            key: GOOGLE_API_KEY,
        });

        fetchMock.get(`${GOOGLE_BASE_URL}?${testParams}`, {
            status: 200,
            body: {
                "destination_addresses": [
                    "1400 Curtis Street, Denver, CO 80204, USA"
                ],
                "origin_addresses": [
                    ""
                ],
                "rows": [{
                    "elements": [{
                        "status": "NOT_FOUND"
                    }]
                }],
                "status": "OK"
            }
        });

        try {
            await getDistance(
                "not-a-coord",
                -104.968091,
                "1400 Curtis Street",
                "Denver",
                "CO",
                "80204");
            throw new Error("fail test, you shouldn't get here");
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });

    test("throws 400 for other API errors", async function () {
        fetchMock.reset();

        const testParams = new URLSearchParams({
            origins: "39.644843,-104.968091",
            destinations: "1400 Curtis Street, Denver, CO 80202",
            units: "imperial",
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
            await getDistance(
                39.644843,
                -104.968091,
                "1400 Curtis Street",
                "Denver",
                "CO",
                "80204"
            );
            throw new Error("fail test, you shouldn't get here");
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });
});


describe("checks dates are valid", function () {
    test("true for valid dates", function () {
        const today = dayjs();
        const format = 'YYYY-MM-DD';
        const today_formatted = today.format(format);

        expect(DateValidation.validateDates(
            today_formatted, today.add(2, "day").format(format))).toEqual(true);
        expect(DateValidation.validateDates(
            today_formatted, today.add(1, "year").format(format))).toEqual(true);
        expect(DateValidation.validateDates(
            today_formatted, today)).toEqual(true);
    });

    test("false for invalid dates", function () {
        const today = dayjs();
        const format = 'YYYY-MM-DD';
        const today_formatted = today.format(format);

        expect(DateValidation.validateDates(
            today_formatted, today.subtract(1, "month").format(format))).toEqual(false);
        expect(DateValidation.validateDates(
            today_formatted, today.subtract(1, "day").format(format))).toEqual(false);
        expect(DateValidation.validateDates(
            today_formatted, today.subtract(1, "year").format(format))).toEqual(false);
        expect(DateValidation.validateDates(
            today.subtract(1, "month"), today.add(1, "day").format(format))).toEqual(false);
        expect(DateValidation.validateDates(
            today.subtract(3, "day"), today.subtract(1, "day").format(format))).toEqual(false);
        expect(DateValidation.validateDates(
            today.add(2, "year"), today.add(2, "year").format(format))).toEqual(false);
        expect(DateValidation.validateDates(
            today_formatted, today.add(2, "year").format(format))).toEqual(false);
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
