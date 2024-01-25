"use strict";

const AxiosMockAdapter = require("axios-mock-adapter");
const axios = require("axios");
const axiosMock = new AxiosMockAdapter(axios);

const { GOOGLE_API_KEY } = require("../config");
const { convertZipCodeToCoords, GOOGLE_BASE_URL } = require("../helpers/zipToCoords");
const { BadRequestError } = require("../helpers/expressError"); 
 

// REAL VERSION. RUNNING THIS TEST COUNTS AGAINST OUR API LIMIT
describe("convertZipCodeToCoords", function () {
    test("converts valid zip code to lat and long", function () {
        console.log("testing convertZipCodeToCoords; calling API")
        const [lat, long] = convertZipCodeToCoords(80113);
        
        expect(lat).toEqual(39.644843);
        expect(long).toEqual(-104.968091);
    });

    test("throws 400 for invalid zip code", function () {
        console.log("testing convertZipCodeToCoords; calling API")
        try {
            convertZipCodeToCoords("invalid_zip");
            throw new Error("fail test, you shouldn't get here");
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });
});


// MOCKED VERSION. RUN WITHOUT RESTRAINT.
describe("convertZipCodeToCoords", function () {
    
    test("converts valid zip code to lat and long", function () {
        axiosMock.onGet(`${GOOGLE_BASE_URL}/?address=${zip}&key=${GOOGLE_API_KEY}`)
          .reply(200, {
            "results": {
                "geometry": {
                    "location": {
                        "lat": 39.644843,
                        "lng": -104.968091
                    },
                },
                "status": "OK"
            }
        });

        const [lat, long] = convertZipCodeToCoords(80113);
        
        expect(lat).toEqual(39.644843);
        expect(long).toEqual(-104.968091);
    });

    test("throws 400 for invalid zip code", function () {
        axiosMock.onGet(`${GOOGLE_BASE_URL}/?address=${zip}&key=${GOOGLE_API_KEY}`)
          .reply(200, {
            "results":{
                "status": "ZERO_RESULTS"
            }
        });

        try {
            convertZipCodeToCoords("invalid_zip");
            throw new Error("fail test, you shouldn't get here");
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });

    test("throws 400 for other API errors", function () {
        axiosMock.onGet(`${GOOGLE_BASE_URL}/?address=${zip}&key=${GOOGLE_API_KEY}`)
          .reply(200, {
            "results":{
                "status": "OVER_DAILY_LIMIT"
            }
        });

        try {
            convertZipCodeToCoords("invalid_zip");
            throw new Error("fail test, you shouldn't get here");
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });
});
