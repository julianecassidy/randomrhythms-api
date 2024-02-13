const GET_CONCERTS_API_RESP = {
    "success": true,
    "pagination": {
        "page": 1,
        "perPage": 40,
        "totalItems": 9,
        "totalPages": 1,
        "nextPage": null,
        "previousPage": null
    },
    "events": [
        {
            "@type": "Concert",
            "name": "Ben Rector at Boettcher Concert Hall",
            "identifier": "jambase:11070750",
            "url": "https://www.jambase.com/show/ben-rector-boettcher-concert-hall-20240201",
            "image": "https://www.jambase.com/wp-content/uploads/2023/01/ben-rector-1480x832.png",
            "sameAs": [],
            "datePublished": "2023-09-25T17:34:58Z",
            "dateModified": "2024-01-11T17:06:40Z",
            "eventStatus": "scheduled",
            "startDate": "2024-02-01T19:30:00",
            "endDate": "2024-02-01",
            "previousStartDate": "",
            "doorTime": "",
            "location": {
                "@type": "Venue",
                "name": "Boettcher Concert Hall",
                "identifier": "jambase:338239",
                "url": "https://www.jambase.com/venue/boettcher-concert-hall",
                "image": "",
                "datePublished": "2015-08-13T09:59:01Z",
                "dateModified": "2024-01-23T07:05:16Z",
                "address": {
                    "@type": "PostalAddress",
                    "streetAddress": "1400 Curtis Street",
                    "addressLocality": "Denver",
                    "postalCode": "80202",
                    "addressRegion": {
                        "@type": "State",
                        "identifier": "US-CO",
                        "name": "Colorado",
                        "alternateName": "CO"
                    },
                    "addressCountry": {
                        "@type": "Country",
                        "identifier": "US",
                        "name": "United States",
                        "alternateName": "USA"
                    },
                    "x-streetAddress2": "",
                    "x-timezone": "America/Denver",
                    "x-jamBaseMetroId": 8,
                    "x-jamBaseCityId": 4227820
                },
                "geo": {
                    "@type": "GeoCoordinates",
                    "latitude": 39.7453,
                    "longitude": -104.9972
                }
            },
            "offers": [
                {
                    "@type": "Offer",
                    "name": "Ben Rector Denver Tickets on Venue Website",
                    "identifier": "jambase:0",
                    "url": "https://coloradosymphony.org/?utm_source=jambase",
                    "datePublished": "2023-09-25T17:34:58Z",
                    "dateModified": "2024-01-11T17:06:40Z",
                    "category": "ticketingLinkPrimary",
                    "priceSpecification": {},
                    "seller": {
                        "@type": "Organization",
                        "name": "Venue Website",
                        "identifier": "ticket-provider",
                        "disambiguatingDescription": "eventTicketVendorPrimary"
                    },
                    "validFrom": "2023-09-25T17:34:58Z",
                    "x-spansDays": 1
                },
                {
                    "@type": "Offer",
                    "name": "Ben Rector Denver Tickets on SeatGeek",
                    "identifier": "jambase:11501072",
                    "url": "https://seatgeek.pxf.io/c/252938/1756891/20501?url=https%3A%2F%2Fseatgeek.com%2Fben-rector-tickets%2Fdenver-colorado-boettcher-concert-hall-2024-02-01-7-30-pm%2Fconcert%2F6345468%3Faid%3D13185",
                    "datePublished": "2024-01-11T17:06:39Z",
                    "dateModified": "2024-01-11T17:06:39Z",
                    "category": "ticketingLinkSecondary",
                    "priceSpecification": {},
                    "seller": {
                        "@type": "Organization",
                        "name": "SeatGeek",
                        "identifier": "seatgeek",
                        "disambiguatingDescription": "eventTicketVendorSecondary"
                    },
                    "validFrom": "2024-01-11T17:06:39Z",
                    "x-spansDays": 1
                },
                {
                    "@type": "Offer",
                    "name": "Ben Rector Denver Tickets on Ticketmaster Resale",
                    "identifier": "jambase:11321764",
                    "url": "https://ticketmaster.evyy.net/c/252938/271177/4272?u=https%3A%2F%2Fwww.ticketmaster.com%2Fevent%2FZ7r9jZ1A7vFbt",
                    "datePublished": "2023-11-22T16:32:46Z",
                    "dateModified": "2023-11-22T16:32:46Z",
                    "category": "ticketingLinkSecondary",
                    "priceSpecification": {},
                    "seller": {
                        "@type": "Organization",
                        "name": "Ticketmaster Resale",
                        "identifier": "ticketmaster-resale",
                        "disambiguatingDescription": "eventTicketVendorSecondary"
                    },
                    "validFrom": "2023-11-22T16:32:46Z",
                    "x-spansDays": 1
                }
            ],
            "performer": [
                {
                    "@type": "MusicGroup",
                    "name": "Ben Rector",
                    "identifier": "jambase:47625",
                    "url": "https://www.jambase.com/band/ben-rector",
                    "image": "https://www.jambase.com/wp-content/uploads/2023/01/ben-rector-1480x832.png",
                    "datePublished": "2015-06-21T17:56:56Z",
                    "dateModified": "2024-01-25T04:13:06Z",
                    "x-bandOrMusician": "band",
                    "x-numUpcomingEvents": 29,
                    "genre": [
                        "folk",
                        "indie",
                        "pop",
                        "rock"
                    ],
                    "x-performanceDate": "2024-02-01",
                    "x-performanceRank": 1,
                    "x-isHeadliner": true,
                    "x-dateIsConfirmed": true
                },
                {
                    "@type": "MusicGroup",
                    "name": "Cody Fry",
                    "identifier": "jambase:4416530",
                    "url": "https://www.jambase.com/band/cody-fry",
                    "image": "https://www.jambase.com/wp-content/uploads/2021/08/jambase-default-band-image-bw-1480x832.png",
                    "datePublished": "2018-06-28T19:58:44Z",
                    "dateModified": "2024-01-25T00:42:31Z",
                    "x-bandOrMusician": "band",
                    "x-numUpcomingEvents": 7,
                    "genre": [
                        "folk",
                        "indie"
                    ],
                    "x-performanceDate": "2024-02-01",
                    "x-performanceRank": 2,
                    "x-isHeadliner": false,
                    "x-dateIsConfirmed": true
                }
            ],
            "eventAttendanceMode": "live",
            "isAccessibleForFree": false,
            "x-streamIds": [],
            "x-headlinerInSupport": false,
            "x-promoImage": "",
            "x-customTitle": "",
            "x-subtitle": ""
        },
        {
            "@type": "Concert",
            "name": "Silent Planet at Summit Music Hall",
            "identifier": "jambase:11297801",
            "url": "https://www.jambase.com/show/silent-planet-summit-music-hall-20240201",
            "image": "https://www.jambase.com/wp-content/uploads/2017/04/silent-planet-silent-planet-0ddd54a3-9fb1-4314-a48d-8ace7dafd1a7_279581_TABLET_LANDSCAPE_LARGE_16_9-1480x832.jpg",
            "sameAs": [],
            "datePublished": "2023-11-15T22:12:03Z",
            "dateModified": "2024-01-05T15:13:33Z",
            "eventStatus": "scheduled",
            "startDate": "2024-02-01T18:00:00",
            "endDate": "2024-02-01",
            "previousStartDate": "",
            "doorTime": "",
            "location": {
                "@type": "Venue",
                "name": "Summit Music Hall",
                "identifier": "jambase:68444",
                "url": "https://www.jambase.com/venue/summit-music-hall",
                "image": "",
                "datePublished": "2015-06-22T08:02:51Z",
                "dateModified": "2024-01-24T16:12:46Z",
                "address": {
                    "@type": "PostalAddress",
                    "streetAddress": "1902 Blake St",
                    "addressLocality": "Denver",
                    "postalCode": "80202",
                    "addressRegion": {
                        "@type": "State",
                        "identifier": "US-CO",
                        "name": "Colorado",
                        "alternateName": "CO"
                    },
                    "addressCountry": {
                        "@type": "Country",
                        "identifier": "US",
                        "name": "United States",
                        "alternateName": "USA"
                    },
                    "x-streetAddress2": "",
                    "x-timezone": "America/Denver",
                    "x-jamBaseMetroId": 8,
                    "x-jamBaseCityId": 4227820
                },
                "geo": {
                    "@type": "GeoCoordinates",
                    "latitude": 39.7533,
                    "longitude": -104.9951
                }
            },
            "offers": [
                {
                    "@type": "Offer",
                    "name": "Silent Planet Denver Tickets on Live Nation",
                    "identifier": "jambase:11297806",
                    "url": "https://ticketmaster.evyy.net/c/252938/264167/4272?u=https%3A%2F%2Fconcerts.livenation.com%2Fsilent-planet-denver-colorado-02-01-2024%2Fevent%2F1E005F6E984C10F1",
                    "datePublished": "2023-11-15T22:12:03Z",
                    "dateModified": "2023-11-15T22:12:03Z",
                    "category": "ticketingLinkPrimary",
                    "priceSpecification": {
                        "@type": "PriceSpecification",
                        "minPrice": "",
                        "maxPrice": "",
                        "price": "22.00",
                        "priceCurrency": "USD"
                    },
                    "seller": {
                        "@type": "Organization",
                        "name": "Live Nation",
                        "identifier": "live-nation",
                        "disambiguatingDescription": "eventTicketVendorPrimary"
                    },
                    "validFrom": "2023-11-15T22:12:03Z",
                    "x-spansDays": 1
                },
                {
                    "@type": "Offer",
                    "name": "Silent Planet Denver Tickets on SeatGeek",
                    "identifier": "jambase:11312413",
                    "url": "https://seatgeek.pxf.io/c/252938/1756891/20501?url=https%3A%2F%2Fseatgeek.com%2Fsilent-planet-tickets%2Fdenver-colorado-summit-denver-2024-02-01-6-pm%2Fconcert%2F6282146%3Faid%3D13185",
                    "datePublished": "2023-11-20T19:01:23Z",
                    "dateModified": "2023-11-20T19:01:23Z",
                    "category": "ticketingLinkSecondary",
                    "priceSpecification": {},
                    "seller": {
                        "@type": "Organization",
                        "name": "SeatGeek",
                        "identifier": "seatgeek",
                        "disambiguatingDescription": "eventTicketVendorSecondary"
                    },
                    "validFrom": "2023-11-20T19:01:23Z",
                    "x-spansDays": 1
                },
                {
                    "@type": "Offer",
                    "name": "Silent Planet Denver Tickets on StubHub",
                    "identifier": "jambase:11314100",
                    "url": "https://prf.hn/click/camref:1011l9QnS/destination:https://www.stubhub.com/silent-planet-denver-tickets-2-1-2024/event/152609088/",
                    "datePublished": "2023-11-20T19:31:13Z",
                    "dateModified": "2023-11-20T19:31:13Z",
                    "category": "ticketingLinkSecondary",
                    "priceSpecification": {},
                    "seller": {
                        "@type": "Organization",
                        "name": "StubHub",
                        "identifier": "stubhub",
                        "disambiguatingDescription": "eventTicketVendorSecondary"
                    },
                    "validFrom": "2023-11-20T19:31:13Z",
                    "x-spansDays": 1
                }
            ],
            "performer": [
                {
                    "@type": "MusicGroup",
                    "name": "Silent Planet",
                    "identifier": "jambase:53334",
                    "url": "https://www.jambase.com/band/silent-planet",
                    "image": "https://www.jambase.com/wp-content/uploads/2017/04/silent-planet-silent-planet-0ddd54a3-9fb1-4314-a48d-8ace7dafd1a7_279581_TABLET_LANDSCAPE_LARGE_16_9-1480x832.jpg",
                    "datePublished": "2015-06-22T01:19:02Z",
                    "dateModified": "2024-01-25T01:22:02Z",
                    "x-bandOrMusician": "band",
                    "x-numUpcomingEvents": 27,
                    "genre": [
                        "metal",
                        "punk"
                    ],
                    "x-performanceDate": "2024-02-01",
                    "x-performanceRank": 1,
                    "x-isHeadliner": true,
                    "x-dateIsConfirmed": true
                },
                {
                    "@type": "MusicGroup",
                    "name": "Thornhill",
                    "identifier": "jambase:219048",
                    "url": "https://www.jambase.com/band/thornhill",
                    "image": "https://www.jambase.com/wp-content/uploads/2021/08/jambase-default-band-image-bw-1480x832.png",
                    "datePublished": "2015-07-14T00:12:06Z",
                    "dateModified": "2024-01-25T01:31:55Z",
                    "x-bandOrMusician": "band",
                    "x-numUpcomingEvents": 20,
                    "genre": [
                        "metal",
                        "punk"
                    ],
                    "x-performanceDate": "2024-02-01",
                    "x-performanceRank": 2,
                    "x-isHeadliner": false,
                    "x-dateIsConfirmed": true
                },
                {
                    "@type": "MusicGroup",
                    "name": "Aviana",
                    "identifier": "jambase:6217137",
                    "url": "https://www.jambase.com/band/aviana",
                    "image": "https://www.jambase.com/wp-content/uploads/2023/01/aviana-1480x832.png",
                    "datePublished": "2019-12-13T19:32:13Z",
                    "dateModified": "2024-01-25T01:52:36Z",
                    "x-bandOrMusician": "band",
                    "x-numUpcomingEvents": 24,
                    "genre": [
                        "metal",
                        "punk"
                    ],
                    "x-performanceDate": "2024-02-01",
                    "x-performanceRank": 3,
                    "x-isHeadliner": false,
                    "x-dateIsConfirmed": true
                },
                {
                    "@type": "MusicGroup",
                    "name": "Johnny Booth",
                    "identifier": "jambase:257296",
                    "url": "https://www.jambase.com/band/johnny-booth",
                    "image": "https://www.jambase.com/wp-content/uploads/2021/08/jambase-default-band-image-bw-1480x832.png",
                    "datePublished": "2015-07-15T06:12:11Z",
                    "dateModified": "2024-01-25T02:02:59Z",
                    "x-bandOrMusician": "band",
                    "x-numUpcomingEvents": 13,
                    "genre": [
                        "metal"
                    ],
                    "x-performanceDate": "2024-02-01",
                    "x-performanceRank": 4,
                    "x-isHeadliner": false,
                    "x-dateIsConfirmed": true
                }
            ],
            "eventAttendanceMode": "live",
            "isAccessibleForFree": false,
            "x-streamIds": [],
            "x-headlinerInSupport": false,
            "x-promoImage": "",
            "x-customTitle": "",
            "x-subtitle": ""
        }
    ]
};

const GET_CONCERT_API_RESP = {
    "success": true,
    "event": {
        "@type": "Concert",
        "name": "Ben Rector at Boettcher Concert Hall",
        "identifier": "jambase:11070750",
        "url": "https://www.jambase.com/show/ben-rector-boettcher-concert-hall-20240201",
        "image": "https://www.jambase.com/wp-content/uploads/2023/01/ben-rector-1480x832.png",
        "sameAs": [],
        "datePublished": "2023-09-25T17:34:58Z",
        "dateModified": "2024-01-11T17:06:40Z",
        "eventStatus": "scheduled",
        "startDate": "2024-02-01T19:30:00",
        "endDate": "2024-02-01",
        "previousStartDate": "",
        "doorTime": "",
        "location": {
            "@type": "Venue",
            "name": "Boettcher Concert Hall",
            "identifier": "jambase:338239",
            "url": "https://www.jambase.com/venue/boettcher-concert-hall",
            "image": "",
            "datePublished": "2015-08-13T09:59:01Z",
            "dateModified": "2024-01-23T07:05:16Z",
            "address": {
                "@type": "PostalAddress",
                "streetAddress": "1400 Curtis Street",
                "addressLocality": "Denver",
                "postalCode": "80202",
                "addressRegion": {
                    "@type": "State",
                    "identifier": "US-CO",
                    "name": "Colorado",
                    "alternateName": "CO"
                },
                "addressCountry": {
                    "@type": "Country",
                    "identifier": "US",
                    "name": "United States",
                    "alternateName": "USA"
                },
                "x-streetAddress2": "",
                "x-timezone": "America/Denver",
                "x-jamBaseMetroId": 8,
                "x-jamBaseCityId": 4227820
            },
            "geo": {
                "@type": "GeoCoordinates",
                "latitude": 39.7453,
                "longitude": -104.9972
            }
        },
        "offers": [
            {
                "@type": "Offer",
                "name": "Ben Rector Denver Tickets on Venue Website",
                "identifier": "jambase:0",
                "url": "https://coloradosymphony.org/?utm_source=jambase",
                "datePublished": "2023-09-25T17:34:58Z",
                "dateModified": "2024-01-11T17:06:40Z",
                "category": "ticketingLinkPrimary",
                "priceSpecification": {},
                "seller": {
                    "@type": "Organization",
                    "name": "Venue Website",
                    "identifier": "ticket-provider",
                    "disambiguatingDescription": "eventTicketVendorPrimary"
                },
                "validFrom": "2023-09-25T17:34:58Z",
                "x-spansDays": 1
            },
            {
                "@type": "Offer",
                "name": "Ben Rector Denver Tickets on SeatGeek",
                "identifier": "jambase:11501072",
                "url": "https://seatgeek.pxf.io/c/252938/1756891/20501?url=https%3A%2F%2Fseatgeek.com%2Fben-rector-tickets%2Fdenver-colorado-boettcher-concert-hall-2024-02-01-7-30-pm%2Fconcert%2F6345468%3Faid%3D13185",
                "datePublished": "2024-01-11T17:06:39Z",
                "dateModified": "2024-01-11T17:06:39Z",
                "category": "ticketingLinkSecondary",
                "priceSpecification": {},
                "seller": {
                    "@type": "Organization",
                    "name": "SeatGeek",
                    "identifier": "seatgeek",
                    "disambiguatingDescription": "eventTicketVendorSecondary"
                },
                "validFrom": "2024-01-11T17:06:39Z",
                "x-spansDays": 1
            },
            {
                "@type": "Offer",
                "name": "Ben Rector Denver Tickets on Ticketmaster Resale",
                "identifier": "jambase:11321764",
                "url": "https://ticketmaster.evyy.net/c/252938/271177/4272?u=https%3A%2F%2Fwww.ticketmaster.com%2Fevent%2FZ7r9jZ1A7vFbt",
                "datePublished": "2023-11-22T16:32:46Z",
                "dateModified": "2023-11-22T16:32:46Z",
                "category": "ticketingLinkSecondary",
                "priceSpecification": {},
                "seller": {
                    "@type": "Organization",
                    "name": "Ticketmaster Resale",
                    "identifier": "ticketmaster-resale",
                    "disambiguatingDescription": "eventTicketVendorSecondary"
                },
                "validFrom": "2023-11-22T16:32:46Z",
                "x-spansDays": 1
            }
        ],
        "performer": [
            {
                "@type": "MusicGroup",
                "name": "Ben Rector",
                "identifier": "jambase:47625",
                "url": "https://www.jambase.com/band/ben-rector",
                "image": "https://www.jambase.com/wp-content/uploads/2023/01/ben-rector-1480x832.png",
                "datePublished": "2015-06-21T17:56:56Z",
                "dateModified": "2024-01-25T23:06:10Z",
                "x-bandOrMusician": "band",
                "x-numUpcomingEvents": 29,
                "genre": [
                    "folk",
                    "indie",
                    "pop",
                    "rock"
                ],
                "x-performanceDate": "2024-02-01",
                "x-performanceRank": 1,
                "x-isHeadliner": true,
                "x-dateIsConfirmed": true
            },
            {
                "@type": "MusicGroup",
                "name": "Cody Fry",
                "identifier": "jambase:4416530",
                "url": "https://www.jambase.com/band/cody-fry",
                "image": "https://www.jambase.com/wp-content/uploads/2021/08/jambase-default-band-image-bw-1480x832.png",
                "datePublished": "2018-06-28T19:58:44Z",
                "dateModified": "2024-01-25T00:42:31Z",
                "x-bandOrMusician": "band",
                "x-numUpcomingEvents": 7,
                "genre": [
                    "folk",
                    "indie"
                ],
                "x-performanceDate": "2024-02-01",
                "x-performanceRank": 2,
                "x-isHeadliner": false,
                "x-dateIsConfirmed": true
            }
        ],
        "eventAttendanceMode": "live",
        "isAccessibleForFree": false,
        "x-streamIds": [],
        "x-headlinerInSupport": false,
        "x-promoImage": "",
        "x-customTitle": "",
        "x-subtitle": ""
    },
    "request": {
        "endpoint": "https://www.jambase.com/jb-api/v1/events/id/jambase:11070750",
        "method": "GET",
        "params": {
            "eventDataSource": "jambase",
            "sourceEventId": "11070750",
            "apikey": "123"
        },
        "ip": "76.131.206.234",
        "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0"
    }
};


module.exports = { GET_CONCERTS_API_RESP, GET_CONCERT_API_RESP };