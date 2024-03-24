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
			let messagesDoc = await doc.ref.collection("messages").get();
			let messagesData = messagesDoc.docs.map((message) => message.data());
			let data = {
				createdAt: groupData.createdAt,
				createdBy: groupData.createdBy,
				members: groupData.members,
				groupId: doc.id,
				messages: messagesData,
			};

			if (groupData.isDm) {
				let friend = groupData.members.find((member) => member !== user.uid);
				let friendData = (await usersRef.doc(friend).get()).data();
				data.friend = {
					uid: friend,
					displayName: friendData.displayName,
					email: friendData.email,
					photoURL: friendData.photoURL,
				};
			}

			groups[doc.id] = data;
		}
		return res.status(200).send(groups);
	} catch (error) {
		return errorHandler(res, error);
	}
});

export { messages as messageRoutes };
