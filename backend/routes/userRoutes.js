import { auth, usersRef, el, index } from "../initialize.js";
import { FieldPath, FieldValue } from "firebase-admin/firestore";
import { errorHandler, validateDisplayName } from "../serverHelperFunctions.js";

const { UserNotAuthorizedError, MissingParametersError, InvalidDisplayNameError, DisplayNameTakenError } = el;

import { Router } from "express";
const users = Router();

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
	const displayNameString = req.params.displayNameString;
	const user = req.user;

	try {
		if (!displayNameString) throw MissingParametersError;

		// Algolia Search (Fuzzy Search)
		const results = await index.search(displayNameString);
		var list = results.hits.map((hit) => hit.objectID);

		const friends = (await usersRef.doc(user.uid).get()).data()?.friends?.map((friend) => friend.uid) || [];

		list = list.filter((id) => id !== user.uid && !friends.includes(id));
		if (list.length === 0) return res.status(200).send([]);

		const usersList = await usersRef.where(FieldPath.documentId(), "in", list).limit(10).get();

		const userDataSnap = await usersRef.doc(user.uid).get();
		const userData = userDataSnap.data();
		let users = [];
		usersList.forEach((userItem) => {
			users.push({
				...userItem.data(),
				isFriend: userData?.friends?.includes(userItem.id) || false,
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
			lastUpdatedAt: FieldValue.serverTimestamp(),
		});
		return res.status(200).send("user/data-updated");
	} catch (error) {
		await auth.updateUser(uid, { displayName: null });
		return errorHandler(res, error);
	}
});

export { users as userRoutes };
