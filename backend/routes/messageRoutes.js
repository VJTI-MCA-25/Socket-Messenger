import { el, usersRef, groupsRef } from "../initialize.js";
import { errorHandler } from "../serverHelperFunctions.js";
import { FieldPath } from "firebase-admin/firestore";

const {} = el;

import { Router } from "express";
const messages = Router();

messages.get("/get-messages", async (req, res) => {
	const user = req.user;
	try {
		let groupsList = (await usersRef.doc(user.uid).get()).data().groups || [];
		if (groupsList.length === 0) return res.status(200).send([]);

		const groupDocs = await groupsRef.where(FieldPath.documentId(), "in", groupsList).get();

		let groups = {};
		for await (let doc of groupDocs.docs) {
			let groupData = doc.data();
			let messagesDoc = await doc.ref.collection("messages").orderBy("sentAt", "asc").limitToLast(200).get();
			let messagesData = messagesDoc.docs.map((message) => {
				let data = message.data();
				return {
					...data,
					isUserSent: data.sentBy === user.uid,
					id: message.id,
					time: data.sentAt.toDate().getTime(),
				};
			});

			let memberInfo = {};
			for await (let member of groupData.members) {
				let userInfo = (await usersRef.doc(member).get()).data();
				memberInfo[member] = {
					uid: userInfo.uid,
					displayName: userInfo.displayName,
					email: userInfo.email,
					photoURL: userInfo.photoURL,
				};
			}

			let data = {
				createdAt: groupData.createdAt,
				createdBy: groupData.createdBy,
				members: memberInfo,
				groupId: doc.id,
				messages: messagesData,
				isDm: groupData.isDm,
				photoURL: groupData.photoURL,
				displayName: groupData.displayName,
			};

			if (groupData.isDm) {
				let otherUser = groupData.members.find((member) => member !== user.uid);
				let otherUserInfo = (await usersRef.doc(otherUser).get()).data();
				data.photoURL = otherUserInfo.photoURL;
				data.displayName = otherUserInfo.displayName;
			}

			groups[doc.id] = data;
		}
		return res.status(200).send(groups);
	} catch (error) {
		return errorHandler(res, error);
	}
});

export { messages as messageRoutes };
