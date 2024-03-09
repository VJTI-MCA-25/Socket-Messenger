import { logoutUser } from "./authFunctions";
import { instance } from "./firebase-config";
import axios from "axios";

async function getUserData(user) {
	try {
		const response = await instance.get(`/users/get-data/${user.uid}`);
		return response.data;
	} catch (error) {
		logoutUser();
		throw { ...error.response.data };
	}
}

async function checkDisplayName(displayName) {
	try {
		const response = await axios.get(`/users/check-display-name/${displayName}`);
		return response.data;
	} catch (error) {
		throw { ...error.response.data };
	}
}

async function setData(data) {
	try {
		const response = await instance.post("/users/set-data", {
			data,
		});
		return response.data;
	} catch (error) {
		throw { ...error.response.data };
	}
}

async function getUsersList(displayNameString) {
	try {
		const response = await instance.get(`/users/get-users-list/${displayNameString}`);
		return response.data;
	} catch (error) {
		throw { ...error.response };
	}
}

async function respondInvite(inviteId, status) {
	try {
		const response = await instance.post("/invites/invite-response", {
			inviteId,
			status,
		});
		return response.data;
	} catch (error) {
		throw { ...error.response.data };
	}
}

async function sendInvite(sendTo) {
	try {
		const res = await instance.post("/invites/send-invite", { sendTo });
		return res.data;
	} catch (error) {
		throw { ...error.response.data };
	}
}

export { getUserData, checkDisplayName, setData, getUsersList, respondInvite, sendInvite };
