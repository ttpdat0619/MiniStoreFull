/**
 * Calculate the difference in days between now and a given date.
 * @param {Date|string} fromDate - The starting date to compare against.
 * @returns {number} - Number of days elapsed (can be decimal).
 */
export const getDaysSince = (fromDate) => {
    const now = new Date();
    const start = new Date(fromDate);
    return (now - start) / (1000 * 60 * 60 * 24);
};

/**
 * Check if the edit window has expired.
 * @param {Date|string} fromDate - The creation/sent date.
 * @param {number} maxDays - Maximum allowed days (e.g., 2, 3, 4).
 * @returns {boolean} - true if expired (beyond the window).
 */
export const isEditWindowExpired = (fromDate, maxDays = 3) => {
    return getDaysSince(fromDate) > maxDays;
};

/**
 * Check if the edit window is still active (not yet expired).
 * @param {Date|string} fromDate - The creation/sent date.
 * @param {number} maxDays - Maximum allowed days.
 * @returns {boolean} - true if still within the edit window.
 */
export const isWithinEditWindow = (fromDate, maxDays = 3) => {
    return getDaysSince(fromDate) <= maxDays;
};
