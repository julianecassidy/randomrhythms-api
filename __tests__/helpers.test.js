"use strict";

const { convertZipCodeToCoords } = require("../helpers/zipToCoords");
const { BadRequestError } = require("../helpers/expressError"); 
 

describe("convertZipCodeToCoords", function () {
    test("converts valid zip code to lat and long", function () {

    });

    test("throws 400 for invalid zip code", function () {
        try {
            convertZipCodeToCoords("invalid_zip");
            throw new Error("fail test, you shouldn't get here");
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });
});