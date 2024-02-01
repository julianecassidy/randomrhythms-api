"use strict"; 

const { GOOGLE_API_KEY } = require("../config");
const GOOGLE_BASE_URL = "https://maps.googleapis.com/maps/api/geocode/json";

const { BadRequestError } = require("./expressError");

/** Converts a five digit zip code string into latitude and longitude.
 * ex. "80113" -> {lat: 39.644843, lng: -104.968091}
 */
async function convertZipCodeToCoords(zipCode) {

    const params = new URLSearchParams({
        components: `postal_code:${zipCode}|country:US`,
        key: GOOGLE_API_KEY,
    });
    
    const resp = await fetch(
        `${GOOGLE_BASE_URL}?${params}`,
        {method: 'GET'}
    )
    const locationData = await resp.json();

    console.log(locationData);
    
    if (locationData.status === "OK") {
        return locationData.results[0].geometry.location;
    } else {
        throw new BadRequestError;
    }    
}

module.exports = { convertZipCodeToCoords, GOOGLE_BASE_URL };