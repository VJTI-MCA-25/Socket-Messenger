import { FieldValue } from "firebase-admin/firestore";
import { usersRef, el, groupsRef } from "../initialize.js";
import { errorHandler } from "../serverHelperFunctions.js";

const {
	UserNotFoundError,
	ProvidedUidNotAFriendError,
	CannotRemoveSelfError,
	MissingParametersError,
	GroupAlreadyExists,
	CannotCreateGroupWithSelfError,
} = el;

import { Router } from "express";
const friends = Router();

friends.delete("/:uid", async (req, res) => {
	const { uid } = req.params;
	const user = req.user;

	try {
		let userData = (await usersRef.doc(user.uid).get()).data();
		let userFriendsList = Object.keys(userData.friends);

		let friendDoc = await usersRef.doc(uid).get();
		let friendData = friendDoc.data();
		let friendFriendsList = Object.keys(friendData.friends);

		if (user.uid === uid) throw CannotRemoveSelfError;
		if (!friendDoc.exists) throw UserNotFoundError;
		if (!userFriendsList.includes(uid)) throw ProvidedUidNotAFriendError;

		let newFriendsList_user = userFriendsList.reduce((acc, friendUid) => {
			if (friendUid !== uid) {
				acc[friendUid] = userData.friends[friendUid];
			}
			return acc;
		}, {});

		let newFriendsList_friend = friendFriendsList.reduce((acc, friendUid) => {
			if (friendUid !== user.uid) {
				acc[friendUid] = friendData.friends[friendUid];
			}
			return acc;
		}, {});

		await Promise.all([
			usersRef.doc(user.uid).update({
				friends: newFriendsList_user,
			}),
			usersRef.doc(uid).update({
				friends: newFriendsList_friend,
			}),
		]);

		res.status(200).send("auth/friend-removed");
	} catch (error) {
		return errorHandler(res, error);
	}
});

friends.post("/create-group", async (req, res) => {
	const user = req.user;
	let list = req.body.list;

	if (!list) throw MissingParametersError;
	if (typeof list === "string") list = [list];
	if (!Array.isArray(list)) throw MissingParametersError;
	if (list.includes(user.uid)) throw CannotCreateGroupWithSelfError;

	try {
		const friends_user = (await usersRef.doc(user.uid).get()).data()?.friends || {};
		const friendsList_user = Object.keys(friends_user);
		const sortedUserIds = [...list, user.uid].sort().join(",");

		if (!list.every((uid) => friendsList_user.includes(uid))) throw ProvidedUidNotAFriendError;
		if (!(await groupsRef.where("sortedUserIds", "==", sortedUserIds).get()).empty) throw GroupAlreadyExists; // Probably should remove this limitation

		let data = {
			members: [...list, user.uid],
			createdAt: FieldValue.serverTimestamp(),
			createdBy: user.uid,
			sortedUserIds,
			isDm: list.length === 1,
		};

		let group = await groupsRef.add(data);
		let groupId = group.id;

		if (list.length === 1) {
			let friendId = list[0];
			let friends_friend = (await usersRef.doc(friendId).get()).data()?.friends || {};

			await Promise.all([
				usersRef.doc(user.uid).update({
					friends: {
						...friends_user,
						[friendId]: {
							...friends_friend[friendId],
							dm: groupId,
						},
					},
				}),
				usersRef.doc(friendId).update({
					friends: {
						...friends_friend,
						[user.uid]: {
							...friends_friend[user.uid],
							dm: groupId,
						},
					},
				}),
			]);
		}

		await Promise.all(
			[...list, user.uid].map((member) => usersRef.doc(member).update({ groups: FieldValue.arrayUnion(groupId) }))
		);

		res.status(201).send({ groupId });
	} catch (error) {
		return errorHandler(res, error);
	}
});

export { friends as friendsRoutes };
