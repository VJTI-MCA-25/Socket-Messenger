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
			let messagesData = messagesDoc.docs.map((message) => {
				let data = message.data();
				return {
					...data,
					isUserSent: data.sentBy === user.uid,
				};
			});

			let memberInfo = {};
			for await (let member of groupData.members) {
				let memberObj;
				if (member === user.uid) {
					memberObj = user;
				} else {
					let memberDoc = await usersRef.doc(member).get();
					memberObj = memberDoc.data();
				}
				memberInfo[member] = {
					uid: memberObj.uid,
					displayName: memberObj.displayName,
					email: memberObj.email,
					photoURL: memberObj.photoURL,
				};
			}

			let data = {
				createdAt: groupData.createdAt,
				createdBy: groupData.createdBy,
				members: memberInfo,
				groupId: doc.id,
				messages: messagesData,
			};

			groups[doc.id] = data;
		}
		return res.status(200).send(groups);
	} catch (error) {
		return errorHandler(res, error);
	}
});

export { messages as messageRoutes };
