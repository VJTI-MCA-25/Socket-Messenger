import { config } from "dotenv";
config();

import { app, auth, usersRef, PORT } from "./initialize.js";
import { Timestamp } from "firebase-admin/firestore";
import {
	errorHandler,
	decodeAndVerify,
	doesUserDataExists,
	logger,
	validateDisplayName,
} from "./serverHelperFunctions.js";
import { sendVerificationEmail } from "./emailActionHandler.js";

import el from "./errorList.json" assert { type: "json" };

// Routes
app.put("/api/users/create", async (req, res) => {
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
		const udExists = await doesUserDataExists(userRecord.uid);
		if (udExists) {
			return errorHandler(res, el.UserDataAlreadyExistsError);
		}

		// Create user data in Firestore
		await usersRef.doc(userRecord.uid).set({
			email: data.email,
			createdAt: Timestamp.now(),
			lastUpdatedAt: Timestamp.now(),
		});

		// Send response
		return res.status(201).send({
			uid: userRecord.uid,
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

app.get("/api/users/verify/:uid", async (req, res) => {
	try {
		const accessToken = req.headers.authorization;
		const uid = req.params.uid;

		const [verifiedStatus] = await decodeAndVerify(accessToken, uid);

		if (verifiedStatus === -1) return errorHandler(res, el.UserDataNotFoundError);
		if (verifiedStatus === 0) return errorHandler(res, el.UserNotAuthorizedError);

		if (verifiedStatus === 1) return res.status(200).send("auth/email-not-verified");
		if (verifiedStatus === 2) return res.status(200).send("auth/user-verified");

		return errorHandler(res, el.UnknownError);
	} catch (error) {
		return errorHandler(res, error);
	}
});

app.get("/api/users/get-data/:uid", async (req, res) => {
	try {
		const accessToken = req.headers.authorization;
		const uid = req.params.uid;

		if (!accessToken || !uid) throw el.MissingParametersError;

		const [verifiedStatus, user] = await decodeAndVerify(accessToken, uid);

		if (verifiedStatus === -1) return errorHandler(res, el.UserDataNotFoundError);
		if (verifiedStatus === 0) return errorHandler(res, el.UserNotAuthorizedError);

		if (verifiedStatus === 2 || verifiedStatus === 1) {
			const userDataSnapshot = await usersRef.doc(uid).get();
			const userData = userDataSnapshot.data();
			return res.status(200).send({ uid, ...userData });
		}
	} catch (error) {
		return errorHandler(res, error);
	}
});

app.post("/api/users/send-verification-mail", async (req, res) => {
	let email = req.body.email;
	let uid = req.body.uid;
	let continueUrl = req.body.continueUrl;

	if ((!email || !uid) && !continueUrl) return errorHandler(res, el.MissingParametersError);

	try {
		let user = !uid ? await auth.getUserByEmail(email) : await auth.getUser(uid);

		if (!user) return errorHandler(res, el.UserNotFoundError);
		if (user.emailVerified) return res.send("auth/email-already-verified");

		sendVerificationEmail(user.email, continueUrl);
		res.status(200).send("auth/verification-email-sent");
	} catch (error) {
		return errorHandler(res, error);
	}
});

app.get("/api/users/check-display-name/:displayName", async (req, res) => {
	try {
		const displayName = req.params.displayName;
		let validation = await validateDisplayName(displayName);

		if (validation === "user/display-name-invalid") return errorHandler(res, el.InvalidDisplayNameError);
		else return res.status(200).send(validation);
	} catch (error) {
		return errorHandler(res, error);
	}
});

app.post("/api/users/set-data", async (req, res) => {
	try {
		const accessToken = req.headers.authorization;
		const uid = req.body.data.uid;
		const displayName = req.body.data.displayName;

		if (!accessToken || !uid || !displayName) return errorHandler(res, el.MissingParametersError);

		const [verifiedStatus] = await decodeAndVerify(accessToken, uid);

		if (verifiedStatus === -1) return errorHandler(res, el.UserDataNotFoundError);
		if (verifiedStatus === 0) return errorHandler(res, el.UserNotAuthorizedError);

		if (verifiedStatus === 2 || verifiedStatus === 1) {
			// Checks for Different Data
			if (displayName) {
				let validation = await validateDisplayName(displayName);
				if (validation === "user/display-name-invalid") return errorHandler(res, el.InvalidDisplayNameError);
				if (validation === "user/display-name-taken") return errorHandler(res, el.DisplayNameTakenError);
			}

			console.log(displayName);
			await getAuth().updateUser(uid, {
				displayName: displayName,
			});

			await usersRef.doc(uid).update({
				displayName,
				lastUpdatedAt: Timestamp.now(),
			});
			return res.status(200).send("user/data-updated");
		}
	} catch (error) {
		await auth.updateUser(uid, { displayName: null });
		return errorHandler(res, error);
	}
});

app.listen(PORT, () => console.log(`Server listening on port ${PORT}!`));
