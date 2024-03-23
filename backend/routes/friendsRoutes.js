import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { usersRef, el, groupsRef } from "../initialize.js";
import { errorHandler } from "../serverHelperFunctions.js";

const {
	UserNotFoundError,
	ProvidedUidNotAFriendError,
	CannotRemoveSelfError,
	MissingParametersError,
	GroupAlreadyExists,
} = el;

import { Router } from "express";
const friends = Router();

friends.get("/get-friends", async (req, res) => {
	const user = req.user;
	try {
		const friends = (await usersRef.doc(user.uid).get()).data()?.friends || [];
		if (friends.length === 0) return res.status(200).send([]);

		const friendsSnap = await usersRef.where(FieldPath.documentId(), "in", friends).get();
		const friendsList = friendsSnap.docs.map((friend) => {
			let data = friend.data();

			return {
				uid: friend.id,
				displayName: data.displayName,
				photoURL: data.photoURL,
				isFriend: true,
			};
		});

		return res.status(200).send(friendsList);
	} catch (error) {
		return errorHandler(res, error);
	}
});

friends.delete("/:uid", async (req, res) => {
	const { uid } = req.params;
	const user = req.user;

	try {
		let userData = (await usersRef.doc(user.uid).get()).data();
		let userFriendsList = userData.friends.map((friend) => friend.uid);

		let friendRef = usersRef.doc(uid);
		let friendData = (await friendRef.get()).data();

		if (user.uid === uid) throw CannotRemoveSelfError;
		if (!(await friendRef.get()).exists) throw UserNotFoundError;
		if (!userFriendsList.includes(uid)) throw ProvidedUidNotAFriendError;

		userFriendsList = userData.friends.filter((friend) => friend.uid !== uid);
		let friendFriendsList = friendData.friends.filter((friend) => friend.uid !== user.uid);

		await Promise.all([
			usersRef.doc(user.uid).update({
				friends: userFriendsList,
			}),
			usersRef.doc(uid).update({
				friends: friendFriendsList,
			}),
		]);

		res.status(200).send("auth/friend-removed");
	} catch (error) {
		errorHandler(res, error);
	}
});

friends.post("/create-group", async (req, res) => {
	const user = req.user;
	var list = req.body.list;

	if (!list) throw MissingParametersError;
	if (typeof list === "string") list = [list];
	if (!Array.isArray(list)) throw MissingParametersError;

	try {
		const friends = (await usersRef.doc(user.uid).get()).data().friends;
		const friendsList = friends.map((friend) => friend.uid);
		const sortedUserIds = [...list, user.uid].sort().join(",");

		if (!list.every((uid) => friendsList.includes(uid))) throw ProvidedUidNotAFriendError;
		if (!(await groupsRef.where("sortedUserIds", "==", sortedUserIds).get()).empty) throw GroupAlreadyExists; // Probably should remove this limitation

		let data = {
			members: [...list, user.uid],
			createdAt: Timestamp.now(),
			createdBy: user.uid,
			sortedUserIds,
		};

		let groupId = group.id;

		await Promise.all(
			[...list, user.uid].map((member) => usersRef.doc(member).update({ groups: FieldValue.arrayUnion(groupId) }))
		);

		if (list.length === 1) {
			let friendId = list[0];
			let friend = friends.find((friend) => friend.uid === friendId);
			friend.dm = groupId;

			let friendsData = (await usersRef.doc(friendId).get()).data().friends;
			let userInFriendsList = friendsData.find((friend) => friend.uid === user.uid);
			userInFriendsList.dm = groupId;

			await Promise.all([
				usersRef.doc(user.uid).update({ friends }),
				usersRef.doc(friendId).update({ friends: friendsData }),
			]);

			data.photoURL = friend.photoURL;
			data.displayName = friend.displayName;
		}

		let group = await groupsRef.add(data);

		res.status(201).send({ groupId });
	} catch (error) {
		return errorHandler(res, error);
	}
});

export { friends as friendsRoutes };
