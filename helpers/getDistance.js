"use strict";

const { GOOGLE_API_KEY } = require("../config");
const GOOGLE_BASE_URL_DISTANCE = "https://maps.googleapis.com/maps/api/distancematrix/json";
const DEFAULT_UNITS = "imperial";

const { BadRequestError } = require("./expressError");

class Distance {
  /** Returns a numeric distance, in the DEFAULT_UNITS, between the geocoordinates
   * representing the origin and the address representing the destination.
   *
   * Throws bad requst error for invalid origin or destination.
   */
  static async getDistance(lat, lng, street, city, state, zip) {

    const params = new URLSearchParams({
      origins: `${lat},${lng}`,
      destinations: `${street}, ${city}, ${state} ${zip}`,
      units: DEFAULT_UNITS,
      key: GOOGLE_API_KEY,
    });

    const resp = await fetch(
      `${GOOGLE_BASE_URL_DISTANCE}?${params}`,
      { method: 'GET' }
    );
    const distanceData = await resp.json();

    if (
      distanceData.status === "OK"
      && distanceData.rows[0].elements[0].status === "OK"
    ) {
      const distance = distanceData.rows[0].elements[0].distance.text;
      return Number(distance.slice(0, -3));
    } else {
      throw new BadRequestError("Invalid origin or destination");
    }
  }
};

module.exports = { Distance, GOOGLE_BASE_URL_DISTANCE };