"use strict";

const _ = require("lodash");

const { JAMBASE_API_KEY } = require("../config");
const { BadRequestError, NotFoundError } = require("../helpers/expressError");
const { Distance } = require("../helpers/getDistance");

const JAMBASE_BASE_URL = "https://www.jambase.com/jb-api/v1/";
const DEFAULT_GEO_RADIUS = 50;
const DEFAULT_GEO_RADIUS_UNITS = "mi";
const DEFAULT_EVENT_SOURCE = "jambase";

/** Concerts. */
class Concert {

   /** Fetch concerts from API.
    * Takes dateFrom, dateTo, lat, lng, geoRadius. dateFrom and dateTo must be
    * dates in the future within the next year.
    * Returns [
    * { id,
        headliner: {
         name,
         bandImageUrl
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
         const formattedConcertPromises = [];
         for (const c of concertData.events) {
            const resp = await this.formatConcertData(c, lat, lng);
            formattedConcertPromises.push(resp);
         }

         const concerts = await Promise.all(formattedConcertPromises);
         return concerts;
      } else {
         throw new BadRequestError;
      }
   }

   /** Parses an object of raw concert data from Jambase API and returns needed
    * fields. This is specific to concert data retreived from Jambase. */
   static async formatConcertData(concertData, origLat, origLng) {
      const headliner = concertData.performer[0];
      const openers = concertData.performer.slice(1);
      const venue = concertData.location;

      let distance = null;
      if (origLat && origLng) {
         distance = await Distance.getDistance(
            origLat,
            origLng,
            venue.address.streetAddress,
            venue.address.addressLocality,
            venue.address.addressRegion.alternateName,
            venue.address.postalCode
         );
      };

      const concert = {
         id: concertData.identifier,
         headliner: {
            name: headliner.name,
            bandImageUrl: headliner.image,
            genres: headliner.genre,
         },
         openers: openers.map(o => o.name),
         venue: {
            name: venue.name,
            venueImageUrl: venue.image,
            streetAddress: venue.address.streetAddress,
            city: venue.address.addressLocality,
            state: venue.address.addressRegion.alternateName,
            zipCode: venue.address.postalCode,
            distance: distance,
         },
         cost: concertData.offers[0]?.priceSpecification?.price || "",
         dateTime: concertData.startDate,
         ticketUrl: concertData.offers[0]?.url || "",
         eventStatus: concertData.eventStatus,
         eventSource: DEFAULT_EVENT_SOURCE,
      };

      return concert;
   }

   /** Takes concert id string like "123" and an id identifier which defaults to
    * "jambase".
    * Returns: {
         id,
         headliner: {
            name,
            band_image,_url
            genres
         },
         openers: [{name, genres}]
         venue: {
            name,
            venueImageUrl,
            address,
            distance
         },
         cost,
         dateTime,
         door_time,
         ticketUrl,
         eventStatus,
         eventSource
       }
    * Throws 404 if concert is not found.
    * Throws 400 if API request fails.
    */
   static async getConcertDetails(id) {
      const params = new URLSearchParams({ apikey: JAMBASE_API_KEY });
      const resp = await fetch(
         `${JAMBASE_BASE_URL}events/id/${id}?${params}`
      );
      const concertData = await resp.json();

      if (concertData.success === true) {
         return this.formatConcertData(concertData.event);
      } else if (concertData.errors[0].code === "identifier_invalid") {
         throw new NotFoundError;
      } else {
         throw new BadRequestError;
      }
   }

   /** Takes dateFrom, dateTo, latitude, longitude, geoRadius, price. geoRadius
    * and price are optional. dateFrom and dateTo must be dates in the future
    * within the next year.
    * Returns one concert that matches filters:
    * {
         id,
         headliner: {
            name,
            band_image,_url
            genres
         },
         openers: [{name, genres}]
         venue: {
            name,
            venueImageUrl,
            address,
            distance
         },
         cost,
         dateTime,
         door_time,
         age limit,
         ticketUrl,
         eventStatus,
         eventSource
       }
    * If no concerts match filters, returns {}.
    * Throws 400 if API requet fails on bad data or other problem.
     */
   static async getRandomConcertDetails({
      dateFrom,
      dateTo,
      lat,
      lng,
      geoRadius = DEFAULT_GEO_RADIUS,
      price
   }) {

      const concerts = await this.getConcerts({
         dateFrom,
         dateTo,
         lat,
         lng,
         geoRadius,
      });

      // no matching concerts
      if (concerts.length === 0) return [];

      // no price given
      if (!price) return _.sample(concerts);

      // price given
      const concertsUnderPrice = concerts.filter(
         c => (c.cost !== "" && c.cost <= price)
      );

      if (concertsUnderPrice.length === 0) return [];

      return _.sample(concertsUnderPrice);


   }
}



module.exports = { Concert, JAMBASE_BASE_URL };