import { config } from "dotenv";
config();

import { app, auth, usersRef, PORT, server, sockets } from "./initialize.js";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
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
		const udExists = await doesUserDataExists(uid);
		if (udExists) {
			return errorHandler(res, el.UserDataAlreadyExistsError);
		}

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
			const userDataSnap = await usersRef.doc(uid).get();
			const userData = userDataSnap.data();

			return res.status(200).send({ uid, ...userData });
		}
	} catch (error) {
		return errorHandler(res, error);
	}
});

app.get("/api/users/get-invites", async (req, res) => {
	try {
		let accessToken = req.headers.authorization;
		let user = await decodeAndVerify(accessToken);

		if (user === -1) return errorHandler(res, el.UserDataNotFoundError);
		else {
			const invitationsSnap = await usersRef
				.doc(user.uid)
				.collection("invitations")
				.where("status", "==", "pending")
				.get();
			let invitations = invitationsSnap.docs.map((invitation) => invitation.data());

			return res.status(200).send(invitations);
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

app.get("/api/users/get-users-list", async (req, res) => {
	const accessToken = req.headers.authorization;
	const displayNameString = req.query.displayNameString;

	try {
		if (!accessToken || !displayNameString) return errorHandler(res, el.MissingParametersError);

		const [verifiedStatus, decodedToken] = await decodeAndVerify(accessToken);

		if (verifiedStatus === -1) return errorHandler(res, el.UserDataNotFoundError);
		else {
			const usersList = await usersRef
				.where("displayName", ">=", displayNameString)
				.where("displayName", "<=", displayNameString + "\uf8ff")
				.limit(10)
				// .where("emailVerified", "==", true)
				.get();

			const userDataSnap = await usersRef.doc(decodedToken.uid).get();
			const userData = userDataSnap.data();
			let users = [];
			usersList.forEach((user) => {
				if (user.id === decodedToken.uid) return;
				users.push({ ...user.data(), isFriend: userData.friends ? userData.friends.includes(user.id) : false });
			});

			return res.status(200).send(users);
		}
	} catch (error) {
		console.log(error);
		return errorHandler(res, error);
	}
});

app.post("/api/users/set-data", async (req, res) => {
	const accessToken = req.headers.authorization;
	const uid = req.body.data.uid;
	const displayName = req.body.data.displayName;
	try {
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

			await auth.updateUser(uid, {
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

app.post("/api/invites/send-invite", async (req, res) => {
	const accessToken = req.headers.authorization;
	const { sendTo } = req.body;
	if (!sendTo) return errorHandler(res, el.MissingParametersError);
	if (!accessToken) return errorHandler(res, el.UserNotAuthorizedError);
	try {
		const [verifiedStatus, user] = await decodeAndVerify(accessToken);
		if (verifiedStatus === -1) return errorHandler(res, el.UserDataNotFoundError);
		else {
			const sendToUserSnap = await usersRef.doc(sendTo).get();
			const sendToUser = sendToUserSnap.data();

			if (!sendToUser) return errorHandler(res, el.UserNotFoundError);
			if (sendToUser.uid === user.uid) return errorHandler(res, el.SelfInviteError);
			if (sendToUser?.friends?.includes(user.uid)) return errorHandler(res, el.AlreadyFriendsError);

			const inviteRef = usersRef.doc(user.uid).collection("invitations").where("status", "==", "pending");

			var inviteSnap = await inviteRef.where("sentTo", "==", sendTo).where("sentBy", "==", user.uid).get();
			if (inviteSnap.docs.length > 0) return errorHandler(res, el.InviteAlreadySentError);

			inviteSnap = await inviteRef.where("sentTo", "==", user.uid).where("sentBy", "==", sendTo).get();
			if (inviteSnap.docs.length > 0) return errorHandler(res, el.InviteAlreadyReceivedError);

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
					return errorHandler(res, el.UnknownError);
				});

			return res.status(200).send("invite/sent");
		}
	} catch (error) {
		return errorHandler(res, error);
	}
});

app.post("/api/invites/invite-response", async (req, res) => {
	const accessToken = req.headers.authorization;
	const { inviteId, response } = req.body;
	const [verifiedStatus, user] = await decodeAndVerify(accessToken);

	try {
		if (response !== "accepted" && response !== "declined") return errorHandler(res, el.InvalidInviteStatusError);
		if (verifiedStatus === -1) return errorHandler(res, el.UserDataNotFoundError);
		else {
			let inviteSnap = await usersRef.doc(user.uid).collection("invitations").doc(inviteId).get();
			let invite = inviteSnap.data();

			if (!invite) return errorHandler(res, el.InviteNotFoundError);
			if (invite.status !== "pending") return errorHandler(res, el.InviteAlreadyProcessedError);

			if (response === "accepted") {
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
				.set({ status: response, processedAt: Timestamp.now() }, { merge: true });
			await usersRef
				.doc(user.uid)
				.collection("invitations")
				.doc(inviteId)
				.set({ status: response, processedAt: Timestamp.now() }, { merge: true });

			return res.status(200).send("invite/response-processed");
		}
	} catch (error) {
		let inviteSnap = await usersRef.doc(user.uid).collection("invitations").doc(inviteId).get();
		let invite = inviteSnap.data();

		if (response === "accepted") {
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

sockets.inviteIo.on("connection", async (socket) => {
	console.log("connected to invites");
	try {
		const token = socket.handshake.auth.token;
		const [verifiedStatus, user] = await decodeAndVerify(token);

		if (verifiedStatus === -1) return socket.disconnect();
		else {
			usersRef
				.doc(user.uid)
				.collection("invitations")
				.where("status", "==", "pending")
				.onSnapshot(async (snap) => {
					let invitations = snap.docs.map((snap) => ({ id: snap.id, ...snap.data() }));
					const returnData = [];
					for (const invitation of invitations) {
						const sentByUserSnap = await usersRef.doc(invitation.sentBy).get();
						const sentByUser = sentByUserSnap.data();
						const invitationWithUser = {
							...invitation,
							sentBy: {
								uid: sentByUser.uid,
								displayName: sentByUser.displayName,
								email: sentByUser.email,
							},
							sentByCurrentUser: invitation.sentBy === user.uid,
						};
						returnData.push(invitationWithUser);
					}
					socket.emit("invites", returnData);
				});
		}
	} catch (error) {
		logger(error);
	}
});

server.listen(PORT, () => console.log(`Server listening on port ${PORT}!`));
