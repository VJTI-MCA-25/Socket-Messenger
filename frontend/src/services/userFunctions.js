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

export { getUserData, checkDisplayName, setData };
