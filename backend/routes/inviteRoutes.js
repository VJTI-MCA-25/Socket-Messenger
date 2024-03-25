import { usersRef, el } from "../initialize.js";
import { FieldValue } from "firebase-admin/firestore";
import { errorHandler, logger } from "../serverHelperFunctions.js";

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

invites.post("/send-invite", async (req, res) => {
	const { sendTo } = req.body;
	const user = req.user;

	try {
		if (!sendTo) throw MissingParametersError;

		const sendToUserSnap = await usersRef.doc(sendTo).get();
		const sendToUser = sendToUserSnap.data();
		let sendToUsersFriendsList = sendToUser?.friends?.map((friend) => friend.uid) || [];

		if (!sendToUser) throw UserNotFoundError;
		if (sendToUser.uid === user.uid) throw SelfInviteError;
		if (sendToUsersFriendsList.includes(user.uid)) throw AlreadyFriendsError;

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
			sentAt: FieldValue.serverTimestamp(),
		};

		const sentInviteRef = await usersRef
			.doc(sendTo)
			.collection("invitations")
			.add({ ...inviteData, sentByCurrentUser: false });

		const inviteId = sentInviteRef.id;

		await usersRef
			.doc(user.uid)
			.collection("invitations")
			.doc(inviteId)
			.set({ ...inviteData, sentByCurrentUser: true })
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
		if (!["accepted", "declined", "canceled"].includes(status)) {
			throw InvalidInviteStatusError;
		}

		const inviteRef = usersRef.doc(user.uid).collection("invitations").doc(inviteId);
		const invite = (await inviteRef.get()).data();

		if (!invite) {
			throw InviteNotFoundError;
		}

		if (invite.status !== "pending") {
			throw InviteAlreadyProcessedError;
		}

		var senderInviteRef = usersRef.doc(invite.sentBy).collection("invitations").doc(inviteId);
		var receiverInviteRef = usersRef.doc(invite.sentTo).collection("invitations").doc(inviteId);

		if (!invite.sentByCurrentUser) {
			[senderInviteRef, receiverInviteRef] = [receiverInviteRef, senderInviteRef];
		}

		if (status === "canceled") {
			if (!invite.sentByCurrentUser) {
				throw UserCannotCancelReceivedInviteError;
			}

			await Promise.all([
				inviteRef.update({ status, processedAt: FieldValue.serverTimestamp() }),
				receiverInviteRef.delete(),
			]);

			return res.status(200).send("invite/canceled");
		}

		if (status === "accepted") {
			await Promise.all([
				usersRef.doc(invite.sentTo).update({
					friends: FieldValue.arrayUnion({
						uid: invite.sentBy,
						befriendedAt: FieldValue.serverTimestamp(),
					}),
				}),
				usersRef.doc(invite.sentBy).update({
					friends: FieldValue.arrayUnion({
						uid: invite.sentTo,
						befriendedAt: FieldValue.serverTimestamp(),
					}),
				}),
			]);
		}

		await Promise.all([
			senderInviteRef.set({ status, processedAt: FieldValue.serverTimestamp() }, { merge: true }),
			receiverInviteRef.set({ status, processedAt: FieldValue.serverTimestamp() }, { merge: true }),
		]);

		return res.status(200).send("invite/response-processed");
	} catch (error) {
		return errorHandler(res, error);
	}
});

export { invites as inviteRoutes };
