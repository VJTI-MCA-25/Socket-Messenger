import { auth, usersRef, el } from "./initialize.js";
const { MissingAccessTokenError, MissingParametersError, UserDataNotFoundError, InvalidDisplayNameError } = el;

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
 * @param {import("express").Response} res The http response object
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
 * @param {Boolean} checkDataBase if true, checks if the user data exists in the database
 *
 * @throws {FirebaseAuthError} If accessToken is invalid / expired
 * @throws {MissingAccessTokenError} If accessToken is not provided
 *
 * @returns {Promise<import("firebase-admin/auth").DecodedIdToken>} The decoded token
 */
async function decodeAndVerify(accessToken, checkDataBase = true) {
	if (!accessToken) throw MissingAccessTokenError;
	const decodedToken = await auth.verifyIdToken(accessToken);
	if (checkDataBase) {
		const userDoc = await usersRef.doc(decodedToken.uid).get();
		if (!userDoc.exists) throw UserDataNotFoundError;
	}
	return decodedToken;
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
	if (!uid) throw MissingParametersError;
	const response = await usersRef.doc(uid).get();
	return response.exists;
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

	if (!validate) throw InvalidDisplayNameError;

	const displayNameSnapshot = await usersRef.where("displayName", "==", displayName).get();

	if (!displayNameSnapshot.empty) return "user/display-name-taken";
	else return "user/display-name-available";
}

export { errorHandler, decodeAndVerify, doesUserDataExists, logger, validateDisplayName };
