import { app, groupsRef, PORT, server, sockets, usersRef } from "./initialize.js";
import { logger, errorHandler, decodeAndVerify } from "./functions/serverHelperFunctions.js";

import { noAuthRoutes } from "./routes/noAuthRoutes.js";
import { userRoutes } from "./routes/userRoutes.js";
import { inviteRoutes } from "./routes/inviteRoutes.js";
import { friendsRoutes } from "./routes/friendsRoutes.js";
import { messageRoutes } from "./routes/messageRoutes.js";

import { FieldPath, FieldValue } from "firebase-admin/firestore";

app.use("/api", noAuthRoutes);

// This is the middleware authentication, decodes the user token sent with the request
// It adds the decoded user object from firebase to the app object.
// Any routes placed under this function will need an Id/Access token to be included in the header to work.
app.use(async (req, res, next) => {
	const idToken = req.headers.authorization;
	try {
		let user = await decodeAndVerify(idToken);
		req.user = user;
		next();
	} catch (error) {
		errorHandler(res, error);
	}
});

// Routes
app.use("/api/users", userRoutes);
app.use("/api/invites", inviteRoutes);
app.use("/api/friends", friendsRoutes);
app.use("/api/messages", messageRoutes);

// Socket IO has authentication too, it is defined in intialize.js file
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
		const friends = snap.data()?.friends || {};
		const list = Object.keys(friends);
		if (list.length > 0) {
			dataSubscription = usersRef.where(FieldPath.documentId(), "in", list).onSnapshot((snap) => {
				let friendsData = snap.docs.map((snap) => {
					const data = snap.data();
					return {
						uid: snap.id,
						displayName: data.displayName,
						email: data.email,
						photoURL: data.photoURL,
						befriendedAt: friends[snap.id].befriendedAt,
						isFriend: true,
						dm: friends[snap.id]?.dm || null,
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

sockets.messageIo.on("connection", async (socket) => {
	const user = socket.user;

	async function joinGroups() {
		const groupListSnap = await usersRef.doc(user.uid).get();
		const groupList = groupListSnap.data().groups || [];

		groupList.forEach((groupId) => {
			socket.join(groupId);
		});
	}

	await joinGroups();

	socket.on("rejoin", async () => {
		await joinGroups();
	});

	socket.on("message send", async (message, callback) => {
		const { groupId, content, media } = message;

		try {
			let messageData = {
				groupId: groupId,
				content: content,
				sentBy: user.uid,
				sentAt: FieldValue.serverTimestamp(),
			};

			if (media) {
				if (!["gif", "link", "image"].includes(media.type)) throw InvalidMediaTypeError;
				//TODO Validate media.url and media.preview
				switch (media.type) {
					case "gif":
						messageData.media = {
							type: "gif",
							url: media.url,
							preview: media.preview,
						};
						break;
					case "link":
						messageData.media = {
							audioUrl: media.audioUrl,
							description: media.description,
							imageUrl: media.imageUrl,
							isVideo: media.isVideo,
							title: media.title,
							type: "link",
							videoUrl: media.videoUrl,
							website: media.website,
							isVideoEmbed: media.isVideoEmbed,
							url: media.url,
						};
						break;
					case "image":
						messageData.media = {
							type: "image",
							url: media.url,
							fileName: media.fileName,
						};
						break;
					default:
						break;
				}
			}

			let groupRef = groupsRef.doc(groupId);
			let groupDoc = await groupRef.get();
			if (!groupDoc.exists) return;

			//TODO Use a transaction to get the latest message count and add the new message
			let doc = await groupRef.collection("messages").add(messageData);
			let messageDoc = await doc.get();
			let savedMessage = messageDoc.data();

			socket.to(groupId).emit("message receive", { ...savedMessage, id: messageDoc.id });
			callback({ id: messageDoc.id, time: savedMessage.sentAt });
			//TODO Write events for received and read messages
		} catch (error) {
			logger(error);
			callback({ error: error.message });
		}
	});

	socket.on("leave", (groupId) => {
		socket.leave(groupId);
	});
});

server.listen(PORT, () => {
	process.stdout.write("\u001b[2J\u001b[0;0H");
	console.log("\u001b[32m[Node Server]\u001b[0m Server listening on port \u001b[34m" + PORT + "\u001b[0m!");
});
