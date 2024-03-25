import { FieldValue } from "firebase-admin/firestore";
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
		const friends = (await usersRef.doc(user.uid).get()).data().friends || {};
		const friendsList = Object.keys(friends);
		const sortedUserIds = [...list, user.uid].sort().join(",");

		if (!list.every((uid) => friendsList.includes(uid))) throw ProvidedUidNotAFriendError;
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
			await Promise.all([
				usersRef.doc(user.uid).update({
					friends: {
						[friendId]: {
							dm: groupId,
						},
					},
				}),
				usersRef.doc(friendId).update({
					friends: {
						[user.uid]: {
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
