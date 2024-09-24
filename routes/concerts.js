"use strict";

const express = require("express");
const router = new express.Router();

const jsonschema = require("jsonschema");

const { Concert } = require("../models/concert");
const concertsSchema = require("../schemas/concerts.json");
const concertSchema = require("../schemas/concert.json");
const randomConcertSchema = require("../schemas/randomConcert.json");
const { convertZipCodeToCoords } = require("../helpers/zipToCoords");
const { ensureLoggedIn } = require("../middleware/middleware");
const { BadRequestError } = require("../helpers/expressError");
const { DateValidation } = require("../helpers/validators");

module.exports = router;

/** GET /concerts/ : { params } => { concerts }
 *
 * params must include { dateFrom, dateTo, zipCode }
 * Must include valid bearer token.
 *
 * Returns concerts:
 * [{ id,
        headliner: {
         name,
         bandImageUrl,
         genres
        },
        openers: [name]
        venue: {
         name,
         venueImageUrl,
         address,
         distance
        },
        cost,
        dateTime,
        ticketUrl,
        eventStatus,
        eventSource
       }, ...]

       Authorization required: none
*/
router.get("/", async function (req, res) {
    const validation = jsonschema.validate(
        req.query,
        concertsSchema,
        { required: true }
    );

    if (!validation.valid) {
        const errs = validation.errors.map(e => e.stack);
        throw new BadRequestError(errs);
    }

    const { dateFrom, dateTo, zipCode } = req.query;

    if (!DateValidation.validateDates(dateFrom, dateFrom)) {
        throw new BadRequestError("invalid dates");
    }

    const { lat, lng } = await convertZipCodeToCoords(zipCode);
    const concerts = await Concert.getConcerts({ dateFrom, dateTo, lat, lng });
    return res.json({ concerts });
});

/** GET /concerts/random : { searchParams } => { concerts }
 *
 * searchParams must include { dateFrom, dateTo, zipCode }
 * seachParams can additionally includlike { geoRadius, price }
 * Must include valid bearer token.
 *
 * Returns concerts:
 * [{ id,
        headliner: {
         name,
         bandImageUrl,
         genres
        },
        openers: [name]
        venue: {
         name,
         venueImageUrl,
         address,
         distance
        },
        cost,
        dateTime,
        ticketUrl,
        eventStatus,
        eventSource
       }, ...]

       Authorization required: none.
*/
router.get("/random", async function (req, res) {
    const q = req.query;

    if (q.geoRadius !== undefined) q.geoRadius = +q.geoRadius;
    if (q.price !== undefined) q.price = +q.price;

    const validation = jsonschema.validate(
        q,
        randomConcertSchema,
        { required: true }
    );

    if (!validation.valid) {
        const errs = validation.errors.map(e => e.stack);
        throw new BadRequestError(errs);
    }

    const { dateFrom, dateTo, zipCode, geoRadius, price } = q;

    if (!DateValidation.validateDates(dateFrom, dateFrom)) {
        throw new BadRequestError("invalid dates");
    }

    const { lat, lng } = await convertZipCodeToCoords(zipCode);
    const randomConcert = await Concert.getRandomConcertDetails({
        dateFrom,
        dateTo,
        lat,
        lng,
        geoRadius,
        price
    });
    return res.json({ randomConcert });
});

/** GET /concerts/:id : { id } => { concert }
 *
 * Must include valid bearer token.
 *
 * Returns concert:
 * { id,
        headliner: {
         name,
         bandImageUrl,
         genres
        },
        openers: [name]
        venue: {
         name,
         venueImageUrl,
         address,
         distance
        },
        cost,
        dateTime,
        ticketUrl,
        eventStatus,
        eventSource
       }

       Authorization required: none
*/
router.get("/:id", async function (req, res) {
    const validation = jsonschema.validate(
        req.params,
        concertSchema,
        { required: true }
    );

    if (!validation.valid) {
        const errs = validation.errors.map(e => e.stack);
        throw new BadRequestError(errs);
    }

    const concert = await Concert.getConcertDetails(req.params.id);
    return res.json({ concert });
})



