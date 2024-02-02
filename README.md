# RandomRhythms

Random concerts => new favorite bands

## Project Info
It starts in December 2023 when the year's Spotify Wrapped came out. Mine was, frankly, embarassing. This is mostly because I listen to the same five songs over and over, and I think my roommates might kick me out if I listen to "Born to Run" by Bruce Springsteen one more time.

The 2024 goal is to find new music.

I realized a lot of my favorite bands in the past have come from random concerts where I hardly knew the band and paid very little to get in. Even if I didn't like the music, the people watching was unbeatable.

Instead of choosing a concert by the band, RandomRhythms helps you choose a concert based on the date you want to go, the distance you want to travel, and the amount you want to pay. And, alright, you can filter out the genres you really despise if you must. See all the options that meet your criteria or get a completely random suggestion and just go for it.

Listen to new sounds, check out new local venues, and really shake up your Spotify Wrapped.

### Built With
The languages and frameworks in this project include:

Back End:
- Node
- Express
- Postgres

Front End:
- React

APIs:
- [JamBase API](https://apidocs.jambase.com/)
- [Google Maps Geocoding API](https://developers.google.com/maps/documentation/geocoding/overview)

### Project Outline
Check out the [Miro board](https://miro.com/app/board/uXjVNCfgqA8=/) for the project, including database schema, API routes, and React component heirarchy.

## Getting Started

This project contains both a backend API and (eventually) a frontend React app. To run the API:

### Prerequisites

* npm
  ```sh
  npm install npm@latest -g

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/julianecassidy/randomrhythms.git
   ```
2. Install NPM packages
   ```sh
   npm install
   ```
3. Get API keys
    This project uses the [JamBase API](https://apidocs.jambase.com/). Request an API key from their site.

    It also uses the [Google Maps Geocoding API](https://developers.google.com/maps/documentation/geocoding/overview). Set up a Google Cloud project to get an API key.
4. Create a .env
    Add a .env file in /randomrhythms-api.
    Add the following
    ```
    JAMBASE_API_KEY = {enter your JamBase API key}
    GOOGLE_API_KEY = {enter your Google Maps API key}
    SIGN_UP_CODE = {any string}
    ```

    The sign up code allows you to limit who can sign up for the app if deployed live since these are not free APIs.
5. Start a local development server
    ```sh
    node server.js
    ```

## Authors

Juliane Cassidy - @julianecassidy

## Version History
- 1.0.0 (in production)

## Acknowledgements

