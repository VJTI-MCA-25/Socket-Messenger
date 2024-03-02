import {
	signInWithEmailAndPassword,
	setPersistence,
	browserLocalPersistence,
	browserSessionPersistence,
	signOut,
	onAuthStateChanged,
} from "firebase/auth";
import { auth } from "./firebase-config";
import axios from "axios";

import { parseError } from "./helperFunctions";

// Function to create a user
async function createUser(email, password) {
	try {
		const response = await axios.put("http://localhost:3000/api/users/create", {
			email,
			password,
		});
		return response;
	} catch (error) {
		throw parseError(error);
	}
}

// Function to login a user
async function loginUser(email, password, rememberMe) {
	try {
		await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
		const userCred = await signInWithEmailAndPassword(auth, email, password);
		const user = userCred.user;
		const response = await axios.get(`http://localhost:3000/api/users/verify/${user.uid}`, {
			headers: {
				Authorization: user.accessToken,
			},
		});
		return response;
	} catch (error) {
		await logoutUser(); // Logout if there's an error
		throw parseError(error);
	}
}

// Function to logout a user
async function logoutUser() {
	try {
		await signOut(auth);
	} catch (error) {
		throw parseError(error);
	}
}

function checkLogin() {
	try {
		return new Promise((resolve) => {
			onAuthStateChanged(auth, (user) => {
				if (user) {
					resolve(true);
				} else {
					resolve(false);
				}
			});
		});
	} catch (error) {
		throw parseError(error);
	}
}

async function sendVerificationMail(email, uid, continueUrl) {
	try {
		const response = await axios.post("http://localhost:3000/api/users/send-verification-mail", {
			data: {
				email,
				uid,
				continueUrl,
			},
		});
		return response;
	} catch (error) {
		throw parseError(error);
	}
}

export { createUser, loginUser, logoutUser, checkLogin, sendVerificationMail };
