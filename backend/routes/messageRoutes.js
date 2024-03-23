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

		let messages = [];
		for await (let doc of groupDocs.docs) {
			let groupData = doc.data();
			let messagesDoc = await doc.ref.collection("messages").get();
			let messagesData = messagesDoc.docs.map((message) => message.data());
			messages.push({
				createdAt: groupData.createdAt,
				createdBy: groupData.createdBy,
				members: groupData.members,
				groupId: doc.id,
				messages: messagesData,
			});
		}

		console.log(messages);
		return res.status(200).send(messages);
	} catch (error) {
		return errorHandler(res, error);
	}
});

export { messages as messageRoutes };
