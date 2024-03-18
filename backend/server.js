import { config } from "dotenv";
config();

import { app, PORT, server, sockets, usersRef } from "./initialize.js";
import { logger } from "./serverHelperFunctions.js";

import { userRoutes } from "./routes/userRoutes.js";
import { inviteRoutes } from "./routes/inviteRoutes.js";
import { FieldPath } from "firebase-admin/firestore";

// Routes
app.use("/api/users", userRoutes);
app.use("/api/invites", inviteRoutes);

sockets.inviteIo.on("connection", async (socket) => {
	try {
		const user = socket.user;
		usersRef
			.doc(user.uid)
			.collection("invitations")
			.where("status", "==", "pending")
			.onSnapshot(async (snap) => {
				let invitations = snap.docs.map((snap) => ({
					id: snap.id,
					...snap.data(),
				}));
				for await (const invite of invitations) {
					const sentBySnap = await usersRef.doc(invite.sentBy).get();
					const sentToSnap = await usersRef.doc(invite.sentTo).get();

					if (!sentBySnap.exists || !sentToSnap.exists) {
						invitations = invitations.filter((invite) => invite.id !== invite.id);
						continue;
					}

					const sentBy = sentBySnap.data();
					const sentTo = sentToSnap.data();

					if (invite.sentByCurrentUser) {
						invite.sentTo = {
							uid: sentTo.uid,
							displayName: sentTo.displayName,
							email: sentTo.email,
						};
					} else {
						invite.sentBy = {
							uid: sentBy.uid,
							displayName: sentBy.displayName,
							email: sentBy.email,
						};
					}
				}
				socket.emit("invites", invitations);
			});
	} catch (error) {
		logger(error);
	}
});

sockets.friendsIo.on("connection", async (socket) => {
	const user = socket.user;
	let dataSubscription;
	let listSubscription = usersRef.doc(user.uid).onSnapshot((snap) => {
		const friends = snap.data().friends;
		console.log(friends);

		if (friends?.length > 0) {
			dataSubscription = usersRef.where(FieldPath.documentId(), "in", friends).onSnapshot((snap) => {
				let friendsData = snap.docs.map((snap) => {
					const data = snap.data();
					return {
						uid: snap.id,
						displayName: data.displayName,
						email: data.email,
						photoURL: data.photoURL,
						isFriend: true,
					};
				});
				socket.emit("friends", friendsData);
			});
		} else {
			socket.emit("friends", []);
		}
	});

	socket.on("disconnect", () => {
		listSubscription();
		if (typeof dataSubscription === "function") dataSubscription();
	});
});

server.listen(PORT, () => console.log(`Server listening on port ${PORT}!`));
