import axios from "axios";
import { logoutUser } from "./authFunctions";

async function getUserData(user) {
	try {
		const response = await axios.get(`http://localhost:3000/api/users/get-data/${user.uid}`, {
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
		const response = await axios.get(`http://localhost:3000/api/users/check-display-name/${displayName}`);
		return response.data;
	} catch (error) {
		throw { ...error.response.data };
	}
}

async function setData(user, data) {
	try {
		const response = await axios({
			method: "post",
			url: `http://localhost:3000/api/users/set-data`,
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
