import { config } from "dotenv";
config();

import { app, PORT, server, sockets, usersRef } from "./initialize.js";
import { logger } from "./serverHelperFunctions.js";

import { userRoutes } from "./routes/userRoutes.js";
import { inviteRoutes } from "./routes/inviteRoutes.js";

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

server.listen(PORT, () => console.log(`Server listening on port ${PORT}!`));
