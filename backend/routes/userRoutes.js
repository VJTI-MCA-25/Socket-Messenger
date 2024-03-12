import { auth, usersRef, el } from "../initialize.js";
import { Timestamp } from "firebase-admin/firestore";
import {
	errorHandler,
	doesUserDataExists,
	logger,
	validateDisplayName,
	decodeAndVerify,
} from "../serverHelperFunctions.js";
import { sendVerificationEmail } from "../emailActionHandler.js";

const {
	UserDataAlreadyExistsError,
	UserNotAuthorizedError,
	MissingParametersError,
	InvalidDisplayNameError,
	DisplayNameTakenError,
	UserNotFoundError,
} = el;

import { Router } from "express";
const users = Router();

/* These functions need to unverified, so they are placed above the Middleware */
users.put("/create", async (req, res) => {
	var uid;
	try {
		const data = req.body;

		// Create user in Firebase Authentication
		const userRecord = await auth.createUser({
			email: data.email,
			password: data.password,
		});
		uid = userRecord.uid;

		// Check if user data already exists
		const udExists = await doesUserDataExists(uid);
		if (udExists) throw UserDataAlreadyExistsError;

		// Create user data in Firestore
		await usersRef.doc(uid).set({
			email: data.email,
			uid: uid,
			emailVerified: false,
			createdAt: Timestamp.now(),
			lastUpdatedAt: Timestamp.now(),
		});

		// Send response
		return res.status(201).send({
			uid: uid,
		});
	} catch (error) {
		// Handle errors
		// Delete user if creation fails
		if (uid) {
			await auth.deleteUser(uid).catch(logger);
			await usersRef.doc(uid).delete().catch(logger);
		}
		return errorHandler(res, error);
	}
});

users.post("/send-verification-mail", async (req, res) => {
	let email = req.body.email;
	let uid = req.body.uid;
	let continueUrl = req.body.continueUrl;

	try {
		if ((!email || !uid) && !continueUrl) throw MissingParametersError;
		let user = !uid ? await auth.getUserByEmail(email) : await auth.getUser(uid);

		if (!user) throw UserNotFoundError;
		if (user.emailVerified) return res.send("auth/email-already-verified");

		sendVerificationEmail(user.email, continueUrl);
		res.status(200).send("auth/verification-email-sent");
	} catch (error) {
		return errorHandler(res, error);
	}
});

/* Routes Requiring Verification - Place Below*/
/* Middleware Function (Token Decoder) */
users.use(async (req, res, next) => {
	const idToken = req.headers.authorization;
	try {
		let user = await decodeAndVerify(idToken);
		req.user = user;
		next();
	} catch (error) {
		errorHandler(res, error);
	}
});

users.get("/check-display-name/:displayName", async (req, res) => {
	try {
		const displayName = req.params.displayName;
		let validation = await validateDisplayName(displayName);
		res.status(200).send(validation);
	} catch (error) {
		errorHandler(res, error);
	}
});

users.get("/verify/:uid", async (req, res) => {
	try {
		const uid = req.params.uid;
		const user = req.user;

		if (uid !== user.uid) throw UserNotAuthorizedError;

		return res.status(200).send("auth/user-verified");
	} catch (error) {
		return errorHandler(res, error);
	}
});

users.get("/get-data/:uid", async (req, res) => {
	try {
		const uid = req.params.uid;

		if (!uid) throw MissingParametersError;

		const userDataSnap = await usersRef.doc(uid).get();
		const userData = userDataSnap.data();

		return res.status(200).send({ uid, ...userData });
	} catch (error) {
		return errorHandler(res, error);
	}
});

users.get("/get-users-list/:displayNameString", async (req, res) => {
	//TODO Implement Fuzzy Search (Algolia or Elastisearch)
	const displayNameString = req.params.displayNameString;
	const user = req.user;

	try {
		if (!displayNameString) throw MissingParametersError;

		const usersList = await usersRef
			.where("displayName", ">=", displayNameString)
			.where("displayName", "<=", displayNameString + "\uf8ff")
			.limit(10)
			// .where("emailVerified", "==", true)
			.get();

		const userDataSnap = await usersRef.doc(user.uid).get();
		const userData = userDataSnap.data();
		let users = [];
		usersList.forEach((userItem) => {
			if (userItem.id === user.uid) return;
			users.push({
				...userItem.data(),
				isFriend: userData.friends.includes(userItem.id),
			});
		});

		return res.status(200).send(users);
	} catch (error) {
		console.log(error);
		return errorHandler(res, error);
	}
});

users.post("/set-data", async (req, res) => {
	const uid = req.user.uid;
	const displayName = req.body.data.displayName;
	try {
		if (!uid && !displayName) throw MissingParametersError;

		// Checks for Different Data
		if (displayName) {
			let validation = await validateDisplayName(displayName);

			if (validation === "user/display-name-invalid") throw InvalidDisplayNameError;
			if (validation === "user/display-name-taken") throw DisplayNameTakenError;
		}

		await auth.updateUser(uid, {
			displayName: displayName,
		});

		await usersRef.doc(uid).update({
			displayName,
			lastUpdatedAt: Timestamp.now(),
		});
		return res.status(200).send("user/data-updated");
	} catch (error) {
		await auth.updateUser(uid, { displayName: null });
		return errorHandler(res, error);
	}
});

export { users as userRoutes };
