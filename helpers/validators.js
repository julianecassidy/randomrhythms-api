"use strict";

const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');

dayjs.extend(customParseFormat)

const DATE_FORMAT = 'YYYY-MM-DD';

class DateValidation {
    /** Takes two date strings in "yyyy-mm-dd" format. Checks if dateFrom comes
     * before dateTo or is same. Checks if dates are within next year.
     * Returns boolean.
     *
     * ex. (if today is 2024-02-07)
     * 2024-03-02, 2024-03-05 -> true
     * 2024-03-02, 2024-03-02 -> true
     * 2024-03-01, 2024-02-18 -> false
     * 2000-03-01, 2000-03-05 -> false
     * 2025-03-01, 2024-04-01 -> false */
    static validateDates(dateFrom, dateTo) {

        const today = dayjs().startOf("day");
        const yearFromToday = today.add(1, "year");

        dateFrom = dayjs(dateFrom, DATE_FORMAT, true);
        dateTo = dayjs(dateTo, DATE_FORMAT, true);

        // to date is before from date
        if (dateFrom > dateTo) return false;
        // to date is before today, from date es before today
        if (dateTo < today || dateFrom < today) return false;

        // dates are more than a year out
        if (dateTo > yearFromToday || dateFrom > yearFromToday) return false;

        // dates are valid, including when dates are the same
        return true;
    }
}


module.exports = { DateValidation };