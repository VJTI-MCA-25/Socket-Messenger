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
	} catch (error) {
		logger(error);
	}
});

server.listen(PORT, () => console.log(`Server listening on port ${PORT}!`));
