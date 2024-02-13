"use strict";

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
    validateDates(dateFrom, dateTo) {

        console.log("validateDates");
        const today = new Date();
        const yearFromToday = new Date(new Date().setFullYear(today.getFullYear() + 1));

        dateFrom = new Date(dateFrom);
        dateTo = new Date(dateTo);

        // // from date is earlier than to date, dates are within next year
        // if (dateFrom < dateTo
        //     && today < dateFrom
        //     && dateTo < yearFromToday) {
        //     return true;
        // }

        if (dateFrom > dateTo) return false;
        if (dateTo < today || dateFrom < today) return false;
        if (dateTo > yearFromToday || dateFrom > yearFromToday) return false;

        // handles when dates are the same
        return true;
    }
}


module.exports = { DateValidation };