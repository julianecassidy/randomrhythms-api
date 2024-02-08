"use strict"; 

const express = require("express");
const router = new express.Router();

const jsonschema = require("jsonschema");

const { Concert } = require("../models/concert");
const concertsSchema = require("../schemas/concerts.json");
const concertSchema = require("../schemas/concert.json");
const randomConcertSchema = require("../schemas/randomConcert.json");
const { convertZipCodeToCoords } = require("../helpers/zipToCoords");
const { ensureLoggedIn } = require("../middleware/middleware")
const { BadRequestError } = require("../helpers/expressError");

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
         bandImageUrl
         genres
        },
        openers: [name]
        venue: {
         name,
         venueImageUrl,
         address
        },
        cost,
        dateTime,
        ticketUrl,
        eventStatus,
        eventSource
       }, ...]

       Authorization required: requester must be logged in.
*/
router.get("/", ensureLoggedIn, async function (req, res) {
    const validation = jsonschema.validate(
        req.query,
        concertsSchema,
        { required: true }
    );

    if (!validation) {
        const errs = validation.errors.map(e => e.stack);
        throw new BadRequestError(errs);
    }

    const { dateFrom, dateTo, zipCode } = req.query;

    const { lat, lng } =  await convertZipCodeToCoords(zipCode);
    const concerts = await Concert.getConcerts({ dateFrom, dateTo, lat, lng});
    return res.json({ concerts });
})

/** GET /concerts/:id : { id } => { concert } 
 *  
 * Must include valid bearer token.
 * 
 * Returns concert:
 * { id,
        headliner: {
         name,
         bandImageUrl
         genres
        },
        openers: [name]
        venue: {
         name,
         venueImageUrl,
         address
        },
        cost,
        dateTime,
        ticketUrl,
        eventStatus,
        eventSource
       }

       Authorization required: requester must be logged in.
*/
router.get("/:id", ensureLoggedIn, async function (req, res) {
    const validation = jsonschema.validate(
        req.params,
        concertSchema,
        { required: true }
    );

    if (!validation) {
        const errs = validation.errors.map(e => e.stack);
        throw new BadRequestError(errs);
    }

    const concert = await Concert.getConcerts(req.params.id);
    return res.json({ concert });
})

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
         bandImageUrl
         genres
        },
        openers: [name]
        venue: {
         name,
         venueImageUrl,
         address
        },
        cost,
        dateTime,
        ticketUrl,
        eventStatus,
        eventSource
       }, ...]

       Authorization required: requester must be logged in.
*/
router.get("/random", ensureLoggedIn, async function (req, res) {
    const validation = jsonschema.validate(
        req.query,
        randomConcertSchema,
        { required: true }
    );

    if (!validation) {
        const errs = validation.errors.map(e => e.stack);
        throw new BadRequestError(errs);
    }

    const { dateFrom, dateTo, zipCode } = req.query;

    const { lat, lng } =  await convertZipCodeToCoords(zipCode);
    const concerts = await Concert.getConcerts({ dateFrom, dateTo, lat, lng});
    return res.json({ concerts });
})

