"use strict"; 

const db = require("../db");
const { 
    BadRequestError, 
    UnauthorizedError,
    NotFoundError
} = require("../helpers/expressError");

const DEFAULT_GEORADIUS = 50;

/** Concerts. */
class Concert {

    /** Fetch concerts from API.
     * Takes dateFrom, dateTo, lat, lng, geoRadius.
     * Returns [
     * { jambase_id,
         headliner: {
          name,
          band_image_url
          genres
         },
         openers: [name]
         venue: {
          name,
          venue_image_url,
          address
         },
         cost,
         date_time,
         ticket_url,
         event_status
        }, ...]
     * Throws a 400 if API call fails on bad data or other problem.
     */
    static async getConcerts({ dateFrom, dateTo, lat, lng, geoRadius }) {

    }

    /** Takes concert id string like "jambase:123"
     * Returns: {
        jambase_id,
        headliner: {
        name,
        band_image,_url
        genres
        },
        openers: [{name, genres}]
        venue: {
        name,
        venue_image_url,
        address
        },
        cost,
        date_time,
        door_time,
        age limit,
        ticket_url,
        event_status
        }
     * Throws 404 if concert is not found.
     * Throws 400 if API request fails.
     */
    static async getConcertDetails(id) {

    }

    /** Takes dateFrom, dateTo, latitude, longitude, geoRadius, price. geoRadius
     * and price are optional. 
     * Returns one concert that matches filters:
     * {
        jambase_id,
        headliner: {
        name,
        band_image,_url
        genres
        },
        openers: [{name, genres}]
        venue: {
        name,
        venue_image_url,
        address
        },
        cost,
        date_time,
        door_time,
        age limit,
        ticket_url,
        event_status
        }
     * If no concerts match filters, returns {}.
     * Throws 400 if API requet fails on bad data or other problem.
      */
    static async getRandomConcertDetails() {

    }
}


module.exports = { Concert };