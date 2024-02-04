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

export { getUserData };
