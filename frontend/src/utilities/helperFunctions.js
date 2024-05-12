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

/**
 * Checks if a given string is a valid URL.
 *
 * @param {string} string - The string to be checked.
 * @returns {boolean} - Returns true if the string is a valid URL, otherwise returns false.
 */
function hasValidUrl(string) {
	const urlRegex = new RegExp(/(https?:\/\/[^\s]+)/);
	return urlRegex.test(string);
}

/**
 * Extracts links from a given string.
 *
 * @param {string} string - The input string to extract links from.
 * @returns {string[]} An array of links extracted from the input string.
 */
function getLinksFromString(string) {
	const urlRegex = new RegExp(/(https?:\/\/[^\s]+)/g);
	return string.match(urlRegex);
}

function formatToJSDate(date) {
	const [day, month, year] = date.split("/");

	return new Date(year, month - 1, day).getTime();
}

function dateStringFromDate(date) {
	function pad(n) {
		return n < 10 ? "0" + n : n;
	}

	date = formatToJSDate(date);
	let dateObject = new Date(date);

	let day = dateObject.getDate();
	let month = dateObject.getMonth() + 1;
	let year = dateObject.getFullYear();

	let today = new Date();

	let string = `${pad(day)}/${pad(month)}/${year}`;

	function withinWeek() {
		let days = Math.floor((today - dateObject) / (1000 * 60 * 60 * 24));
		return days <= 7;
	}

	if (withinWeek()) {
		let days = Math.floor((today - dateObject) / (1000 * 60 * 60 * 24));
		if (days === 0) {
			string = "Today";
		} else if (days === 1) {
			string = "Yesterday";
		} else {
			string = dateObject.toLocaleDateString("en-GB", { weekday: "long" });
		}
	}
	return string;
}

export {
	parseError,
	convertToFirebaseTimestamp,
	dateToString,
	processGroups,
	hasValidUrl,
	getLinksFromString,
	formatToJSDate,
	dateStringFromDate,
};
