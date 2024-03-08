import axios from "axios";
import { logoutUser } from "./authFunctions";
import { baseURL } from "./firebase-config";

async function getUserData(user) {
	try {
		const response = await axios.get(`/users/get-data/${user.uid}`, {
			baseURL,
			headers: {
				Authorization: user.accessToken,
			},
		});
		return response.data;
	} catch (error) {
		logoutUser();
		throw { ...error.response.data };
	}
}

async function checkDisplayName(displayName) {
	try {
		const response = await axios.get(`/users/check-display-name/${displayName}`, { baseURL });
		return response.data;
	} catch (error) {
		throw { ...error.response.data };
	}
}

async function setData(user, data) {
	try {
		const response = await axios({
			method: "post",
			url: "/users/set-data",
			baseURL,
			headers: {
				Authorization: user.accessToken,
			},
			data: {
				data: {
					uid: user.uid,
					...data,
				},
			},
		});
		return response.data;
	} catch (error) {
		throw { ...error.response.data };
	}
}

async function getUsersList(user, displayNameString) {
	try {
		const response = await axios({
			method: "get",
			url: "/users/get-users-list",
			baseURL,
			params: {
				displayNameString: displayNameString,
			},
			headers: {
				Authorization: user.accessToken,
			},
		});
		return response.data;
	} catch (error) {
		throw { ...error.response };
	}
}

async function respondInvite(user, invite, response) {
	try {
		const res = await axios({
			method: "post",
			url: "/invites/invite-response",
			baseURL,
			headers: {
				Authorization: user.accessToken,
			},
			data: {
				inviteId: invite.id,
				response,
			},
		});
		return res.data;
	} catch (error) {
		throw { ...error.response.data };
	}
}

async function sendInvite(user, sendTo) {
	try {
		const res = await axios({
			method: "post",
			url: "/invites/send-invite",
			baseURL,
			headers: {
				Authorization: user.accessToken,
			},
			data: {
				sendTo: sendTo.uid,
			},
		});
		return res.data;
	} catch (error) {
		throw { ...error.response.data };
	}
}

export { getUserData, checkDisplayName, setData, getUsersList, respondInvite, sendInvite };
