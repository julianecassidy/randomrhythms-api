"use strict";

const { JAMBASE_API_KEY } = require("../config");
const db = require("../db");
const {
   BadRequestError,
   UnauthorizedError,
   NotFoundError
} = require("../helpers/expressError");

const JAMBASE_BASE_URL = "https://www.jambase.com/jb-api/v1/"
const DEFAULT_GEO_RADIUS = 50;
const DEFAULT_GEO_RADIUS_UNITS = "mi";

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
   static async getConcerts({
      dateFrom,
      dateTo,
      lat,
      lng,
      geoRadius = DEFAULT_GEO_RADIUS
   }) {

      const params = new URLSearchParams({
         eventDateFrom: dateFrom,
         eventDateTo: dateTo,
         geoLatitude: lat,
         geoLongitude: lng,
         geoRadiusAmount: geoRadius,
         geoRadiusUnits: DEFAULT_GEO_RADIUS_UNITS,
         apikey: JAMBASE_API_KEY,
      });

      const resp = await fetch(`${JAMBASE_BASE_URL}events?${params}`);
      const concertData = await resp.json();
      
      if (concertData.success === true) {
         const concerts = concertData.events.map(c => this.formatConcertData(c));
         return concerts;
      } else {
         throw new BadRequestError;
      }
   }

   /** Parses an object of raw concert data from Jambase API and returns needed 
    * fields. */
   static formatConcertData(concertData) {
      const headliner = concertData.performer[0];
      const openers = concertData.performer.slice(1);
      const venue = concertData.location;

      const concert = {
         jambase_id: concertData.identifier,
         headliner: {
            name: headliner.name,
            band_image_url: headliner.image,
            genres: headliner.genre,
         },
         openers: openers.map(o => o.name),
         venue: {
            name: venue.name,
            venue_image_url: venue.image,
            streetAddress: venue.address.streetAddress,
            city: venue.address.addressLocality,
            state: venue.address.addressRegion.alternateName,
            zipCode: venue.address.postalCode,
         },
         cost: concertData.offers[0].priceSpecification.price || "",
         date_time: concertData.startDate,
         ticket_url: concertData.offers[0].url,
         event_status: concertData.eventStatus,
      };

      return concert;
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


module.exports = { Concert, JAMBASE_BASE_URL };