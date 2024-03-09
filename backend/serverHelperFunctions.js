import { auth, usersRef } from "./initialize.js";

import el from "./errorList.json" assert { type: "json" };
import fs from "fs";

//* --------- Error handler --------- *//
function logger(error) {
	// Log the error in a file
	fs.appendFile("error.log", `${new Date().toISOString()}: ${JSON.stringify(error)}\n`, (err) => {
		if (err) {
			console.error("Failed to log error:", err);
		}
	});
}

// Main error handler
/**
 * @function errorHandler
 *
 * @param {Object} res The http response object
 * @param {Error} error The error object
 *
 * This function sends the error response to the client and logs the error.
 *
 * @returns {null}
 */
function errorHandler(res, error, extraInfo = {}, log = false) {
	let statusCode = typeof error.code === "number" ? error.code : 500; // Must be a number
	error.code === "auth/email-already-exists" && (statusCode = 409); // Conflict
	error.code === "auth/invalid-credential" && (statusCode = 401); // Unauthorized
	error.code === "auth/invalid-email" && (statusCode = 400); // Bad Request
	error.code === "auth/invalid-password" && (statusCode = 400); // Bad Request
	error.code === "auth/user-not-found" && (statusCode = 404); // Not Found
	if (statusCode >= 500 || log) {
		console.error(error);
		logger(typeof error === "string" ? error : JSON.stringify(error));
	}

	let statusText = typeof error.code === "string" ? error.code : error.message; // Must be a string
	error.statusText && (statusText = error.statusText); // If statusText is provided, use it

	res.status(statusCode).send({ code: statusCode, message: error.message, statusText, ...extraInfo });
	return res.end();
}
//* --------- Error handler End --------- *//

// Functions
/**
 * @async @function decodeAndVerify
 *
 * @param {String} accessToken The accessToken provided by the client
 * @param {String} uid The uid of the user
 *
 * This function verifies the accessToken and uid. It returns a Promise which resolves to an array of two elements:
 * - statusNumber: Number
 * - decodedToken: Object
 *
 * statusNumber is a number from -1 to 2. It is the sum of the following:
 * - -1 if the userData does not exist
 * -  0 if the uid in the decodedToken **does not** match the uid provided or the userData does not exist or it had no basis to check
 * -  1 if the uid in the decodedToken matches the uid provided and the email is **not** verified
 * -  2 if the uid in the decodedToken matches the uid provided and the email is verified
 *
 *
 * @throws {FirebaseAuthError} If accessToken is invalid
 * @throws {MissingParametersError} If accessToken or uid is not provided
 *
 * @returns {Promise<[number, object]>} [isVerified, decodedToken]
 */
async function decodeAndVerify(accessToken, uid = null) {
	if (!accessToken) throw el.MissingParametersError;
	try {
		const decodedToken = await auth.verifyIdToken(accessToken);
		let verifyStatus = 0;
		if (!uid) return [verifyStatus, decodedToken];

		if (decodedToken.uid === uid) verifyStatus = 1;
		if (decodedToken.email_verified) verifyStatus = 2;

		let userDataExists = await doesUserDataExists(uid);
		if (!userDataExists) verifyStatus = -1;

		return [verifyStatus, decodedToken];
	} catch (error) {
		throw error;
	}
}

/**
 * @async @function doesUserDataExists
 * @param {string} uid The uid of the user
 *
 * This function checks if the userData exists in the database. It returns a Promise which resolves to a boolean value.
 *
 * @throws {MissingParametersError} If uid is not provided
 * @returns {Promise<boolean>}
 */
async function doesUserDataExists(uid) {
	if (!uid) throw el.MissingParametersError;
	try {
		const response = await usersRef.doc(uid).get();
		return response.exists;
	} catch (error) {
		throw error;
	}
}

/**
 * @async @function validateDisplayName
 * @param {String} displayName The displayName to validate
 * @throws {MissingParametersError} If displayName is not provided
 * @returns {Promise<string>} The code specifying the the validation result
 *
 * This function validates the displayName and returns a code specifying the result of the validation.
 *
 * The code can be one of the following:
 *
 * - "user/display-name-available"
 * - "user/display-name-taken"
 * - "user/display-name-invalid"
 *
 */
async function validateDisplayName(displayName) {
	let lengthCheck = displayName.length >= 6 && displayName.length <= 20;
	let repeatUnderscore = !/__+/g.test(displayName);
	let invalidChars = /^[a-z0-9_]*$|^null$/gi.test(displayName);

	let validate = lengthCheck && repeatUnderscore && invalidChars;

	if (!validate) return "user/display-name-invalid";

	try {
		const displayNameSnapshot = await usersRef.where("displayName", "==", displayName).get();

		if (!displayNameSnapshot.empty) return "user/display-name-taken";
		else return "user/display-name-available";
	} catch (error) {
		throw error;
	}
}

export { errorHandler, decodeAndVerify, doesUserDataExists, logger, validateDisplayName };
