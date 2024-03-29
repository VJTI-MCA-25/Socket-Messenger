import { Timestamp } from "firebase/firestore";

/**
 * Parses the error object and returns a standardized error object.
 * @param {Error} error - The error object to be parsed.
 * @returns {Object} - The standardized error object.
 */
function parseError(error) {
	if (error?.code === "ERR_NETWORK") {
		// Network error (server down, no internet, etc.)
		return { message: "Network error", code: 500 };
	} else if (error?.name === "FirebaseError") {
		// Firebase error
		return { message: error.message, statusText: error.code, code: error.code };
	} else if (error?.response?.data) {
		// Axios error, return the error object from the server
		return { ...error.response.data };
	} else {
		// Other errors, return the error object
		return { message: error.message, code: error.code };
	}
}

/**
 * Converts an object to a Firebase Timestamp object.
 * @param {Object} obj - The object to be converted.
 * @param {number} obj._seconds - The seconds value of the timestamp.
 * @param {number} obj._nanoseconds - The nanoseconds value of the timestamp.
 * @returns {Timestamp} - The converted Firebase Timestamp object.
 * @throws {Error} - If the object is invalid.
 */
function convertToFirebaseTimestamp(obj) {
	if (!obj._seconds && !obj._nanoseconds) throw new Error("Invalid object");
	return new Timestamp(obj._seconds, obj._nanoseconds);
}

/**
 * Converts a date object or timestamp to a formatted date string.
 *
 * @param {Date|Timestamp} date - The date object or timestamp to convert.
 * @returns {string} The formatted date string.
 */
function dateToString(date) {
	if (!(date instanceof Timestamp)) date = convertToFirebaseTimestamp(date);

	let dateObject = date.toDate();
	let dateString = dateObject.toLocaleDateString("en-GB");

	return dateString;
}

/**
 * Processes the groups object by sorting the messages within each group by time.
 * @param {Object} groups - The groups object containing group information and messages.
 * @returns {Object} - The updated groups object with sorted messages.
 */
function processGroups(groups) {
	for (let groupId of Object.keys(groups)) {
		let messagesByDate = groups[groupId].messages.reduce((acc, curr) => {
			let date = dateToString(curr.sentAt);
			if (!acc[date]) {
				acc[date] = [];
			}
			acc[date].push({
				...curr,
				time: convertToFirebaseTimestamp(curr.sentAt).toDate().getTime(),
			});
			return acc;
		}, {});

		// Sort messages by time in descending order
		for (let date of Object.keys(messagesByDate)) {
			messagesByDate[date].sort((a, b) => a.time - b.time);
		}

		groups[groupId].messages = messagesByDate;
	}
	return groups;
}

export { parseError, convertToFirebaseTimestamp, dateToString, processGroups };
