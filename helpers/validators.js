"use strict"; 

/** Takes two date strings in "yyyy-mm-dd" format. Checks if dateFrom comes
 * before dateTo or is same. Returns boolean.
 * 
 * ex. 
 * 2024-01-02, 2024-01-05 -> true
 * 2024-01-02, 2024-01-02 -> true
 * 2024-03-01, 2024-01-01 -> false */
function validateDates (dateFrom, dateTo) {
    dateFrom = new Date(dateFrom);
    dateTo = new Date(dateTo);

    if (dateFrom < dateTo) return true;
    if (dateFrom > dateTo) return false;

    // handles when dates are the same
    return true;
}

module.exports = { validateDates };