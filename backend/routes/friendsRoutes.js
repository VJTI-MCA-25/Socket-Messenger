import { FieldValue } from "firebase-admin/firestore";
import { usersRef, el } from "../initialize.js";
import { errorHandler, decodeAndVerify } from "../serverHelperFunctions.js";

const { MissingAccessTokenError, UserNotFoundError, ProvidedUidNotAFriendError, CannotRemoveSelfError } = el;

import { Router } from "express";
const friends = Router();

/* Invite Routes Middleware - Token Decode */
friends.use(async (req, res, next) => {
	const idToken = req.headers.authorization;
	try {
		if (!idToken) throw MissingAccessTokenError;
		const user = await decodeAndVerify(idToken);
		req.user = user;
		next();
	} catch (error) {
		errorHandler(res, error);
	}
});

friends.delete("/:uid", async (req, res) => {
	const { uid } = req.params;
	const user = req.user;

	try {
		let data = (await usersRef.doc(user.uid).get()).data();
		let friends = data.friends;
		let friendRef = usersRef.doc(uid);

		if (user.uid === uid) throw CannotRemoveSelfError;
		if (!(await friendRef.get()).exists) throw UserNotFoundError;
		if (!friends.includes(uid)) throw ProvidedUidNotAFriendError;

		await Promise.all([
			usersRef.doc(user.uid).update({
				friends: FieldValue.arrayRemove(uid),
			}),
			usersRef.doc(uid).update({
				friends: FieldValue.arrayRemove(user.uid),
			}),
		]);
	} catch (error) {
		errorHandler(res, error);
	}
});

export { friends as friendsRoutes };
