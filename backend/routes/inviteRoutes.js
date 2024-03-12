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
	InviteAlreadyProcessedError,
	InvalidInviteStatusError,
	InviteNotFoundError,
	UserCannotCancelReceivedInviteError,
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

		const [sentInviteSnap, receivedInviteSnap] = await Promise.all([
			inviteRef.where("sentTo", "==", sendTo).where("sentBy", "==", user.uid).get(),
			inviteRef.where("sentTo", "==", user.uid).where("sentBy", "==", sendTo).get(),
		]);

		if (sentInviteSnap.docs.length > 0) throw InviteAlreadySentError;
		if (receivedInviteSnap.docs.length > 0) throw InviteAlreadyReceivedError;

		const inviteData = {
			sentBy: user.uid,
			sentTo: sendTo,
			status: "pending",
			sentAt: Timestamp.now(),
		};

		const sentInviteRef = await usersRef
			.doc(sendTo)
			.collection("invitations")
			.add({ ...inviteData, sentByCurrentUser: false });
		const inviteId = sentInviteRef.id;

		await Promise.all([
			usersRef
				.doc(user.uid)
				.collection("invitations")
				.doc(inviteId)
				.set({ ...inviteData, sentByCurrentUser: true }),
			usersRef
				.doc(sendTo)
				.collection("invitations")
				.doc(inviteId)
				.set({ ...inviteData, sentByCurrentUser: false }),
		]).catch(() => {
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
		if (!["accepted", "declined", "canceled"].includes(status)) {
			throw InvalidInviteStatusError;
		}

		const inviteRef = usersRef.doc(user.uid).collection("invitations").doc(inviteId);
		const inviteSnap = await inviteRef.get();
		const invite = inviteSnap.data();

		if (!invite) {
			throw InviteNotFoundError;
		}

		if (invite.status !== "pending") {
			throw InviteAlreadyProcessedError;
		}

		if (status === "canceled") {
			if (!invite.sentByCurrentUser) {
				throw UserCannotCancelReceivedInviteError;
			}

			await inviteRef.update({ status, processedAt: Timestamp.now() });
			await usersRef.doc(invite.sentTo).collection("invitations").doc(inviteId).delete();
		}

		if (status === "accepted") {
			await Promise.all([
				usersRef.doc(user.uid).update({ friends: FieldValue.arrayUnion(invite.sentBy) }),
				usersRef.doc(invite.sentBy).update({ friends: FieldValue.arrayUnion(user.uid) }),
			]);
		}

		await inviteRef.set({ status, processedAt: Timestamp.now() }, { merge: true });

		return res.status(200).send("invite/response-processed");
	} catch (error) {
		const inviteSnap = await usersRef.doc(user.uid).collection("invitations").doc(inviteId).get();
		const invite = inviteSnap.data();

		if (status === "accepted") {
			await Promise.all([
				usersRef.doc(user.uid).update({ friends: FieldValue.arrayRemove(invite.sentBy) }),
				usersRef.doc(invite.sentBy).update({ friends: FieldValue.arrayRemove(user.uid) }),
			]);
		}

		await usersRef
			.doc(user.uid)
			.collection("invitations")
			.doc(inviteId)
			.set({ status: "pending", processedAt: null }, { merge: true });

		return errorHandler(res, error);
	}
});

export { invites as inviteRoutes };
