import { usersRef, el, bucket, auth } from "../initialize.js";
import { getDownloadURL } from "firebase-admin/storage";
import { FieldValue } from "firebase-admin/firestore";
import { errorHandler, logger } from "../functions/serverHelperFunctions.js";

const { MissingParametersError, UserNotFoundError } = el;

import { Router } from "express";
const noAuth = Router();

// This route uses no authentication, this is an open route

noAuth.put("/create", async (req, res) => {
	var uid;
	try {
		const data = req.body;
		// Check if user data already exists
		const udExists = await doesUserDataExists(uid);
		if (udExists) throw UserDataAlreadyExistsError;

		// Create user in Firebase Authentication
		const profilePic = bucket.file("user_profile_pics/default.svg");
		const profilePicUrl = await getDownloadURL(profilePic);

		const userRecord = await auth.createUser({
			email: data.email,
			password: data.password,
			photoURL: profilePicUrl,
		});
		uid = userRecord.uid;

		// Create user data in Firestore
		await usersRef.doc(uid).set({
			email: data.email,
			uid: uid,
			emailVerified: false,
			createdAt: FieldValue.serverTimestamp(),
			lastUpdatedAt: FieldValue.serverTimestamp(),
			photoURL: profilePicUrl,
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

noAuth.post("/send-verification-mail", async (req, res) => {
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

export { noAuth as noAuthRoutes };
