import { usersRef, el } from "../initialize.js";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { errorHandler, logger, decodeAndVerify } from "../serverHelperFunctions.js";

const {
	MissingParametersError,
	UserNotFoundError,
	SelfInviteError,
	AlreadyFriendsError,
	InviteAlreadySentError,
	InviteAlreadyReceivedError,
	UnknownError,
	MissingAccessTokenError,
	InviteAlreadyProcessedError,
	InvalidInviteStatusError,
	InviteNotFoundError,
} = el;

import { Router } from "express";
const invites = Router();

/* Invite Routes Middleware - Token Decode */
invites.use(async (req, res, next) => {
	const idToken = req.headers.authorization;
	try {
		const user = await decodeAndVerify(idToken);
		req.user = user;
		next();
	} catch (error) {
		errorHandler(res, error);
	}
});

invites.post("/send-invite", async (req, res) => {
	const { sendTo } = req.body;
	const user = req.user;

	try {
		if (!sendTo) throw MissingParametersError;
		const sendToUserSnap = await usersRef.doc(sendTo).get();
		const sendToUser = sendToUserSnap.data();

		if (!sendToUser) throw UserNotFoundError;
		if (sendToUser.uid === user.uid) throw SelfInviteError;
		if (sendToUser?.friends?.includes(user.uid)) throw AlreadyFriendsError;

		const inviteRef = usersRef.doc(user.uid).collection("invitations").where("status", "==", "pending");

		var inviteSnap = await inviteRef.where("sentTo", "==", sendTo).where("sentBy", "==", user.uid).get();
		if (inviteSnap.docs.length > 0) throw InviteAlreadySentError;

		inviteSnap = await inviteRef.where("sentTo", "==", user.uid).where("sentBy", "==", sendTo).get();
		if (inviteSnap.docs.length > 0) throw InviteAlreadyReceivedError;

		let inviteData = {
			sentBy: user.uid,
			sentTo: sendTo,
			status: "pending",
			sentAt: Timestamp.now(),
		};

		let sentInviteRef = await usersRef.doc(sendTo).collection("invitations").add(inviteData);
		let inviteId = sentInviteRef.id;
		await usersRef
			.doc(user.uid)
			.collection("invitations")
			.doc(inviteId)
			.set(inviteData)
			.catch(() => {
				usersRef.doc(sendTo).collection("invitations").doc(inviteId).delete().catch(logger);
				throw UnknownError;
			});

		return res.status(200).send("invite/sent");
	} catch (error) {
		return errorHandler(res, error);
	}
});

invites.post("/invite-response", async (req, res) => {
	const { inviteId, status } = req.body;
	const user = req.user;

	try {
		if (status !== "accepted" && status !== "declined") throw InvalidInviteStatusError;
		let inviteSnap = await usersRef.doc(user.uid).collection("invitations").doc(inviteId).get();
		let invite = inviteSnap.data();

		if (!invite) throw InviteNotFoundError;
		if (invite.status !== "pending") throw InviteAlreadyProcessedError;

		if (status === "accepted") {
			await usersRef.doc(user.uid).update({
				friends: FieldValue.arrayUnion(invite.sentBy),
			});
			await usersRef.doc(invite.sentBy).update({
				friends: FieldValue.arrayUnion(user.uid),
			});
		}

		await usersRef
			.doc(invite.sentBy)
			.collection("invitations")
			.doc(inviteId)
			.set({ status, processedAt: Timestamp.now() }, { merge: true });
		await usersRef
			.doc(user.uid)
			.collection("invitations")
			.doc(inviteId)
			.set({ status, processedAt: Timestamp.now() }, { merge: true });

		return res.status(200).send("invite/response-processed");
	} catch (error) {
		let inviteSnap = await usersRef.doc(user.uid).collection("invitations").doc(inviteId).get();
		let invite = inviteSnap.data();

		if (status === "accepted") {
			await usersRef.doc(user.uid).update({
				friends: FieldValue.arrayRemove(invite.sentBy),
			});
			await usersRef.doc(invite.sentBy).update({
				friends: FieldValue.arrayRemove(user.uid),
			});
		}

		await usersRef
			.doc(invite.sentBy)
			.collection("invitations")
			.doc(inviteId)
			.set({ status: "pending", processedAt: null }, { merge: true });
		await usersRef
			.doc(user.uid)
			.collection("invitations")
			.doc(inviteId)
			.set({ status: "pending", processedAt: null }, { merge: true });

		return errorHandler(res, error);
	}
});

export { invites as inviteRoutes };
