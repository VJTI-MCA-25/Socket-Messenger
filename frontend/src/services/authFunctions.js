import {
	signInWithEmailAndPassword,
	setPersistence,
	browserLocalPersistence,
	browserSessionPersistence,
	signOut,
	onAuthStateChanged,
} from "firebase/auth";
import { auth, instance } from "./firebase-config";
import axios from "axios";

import { parseError } from "./helperFunctions";

// Function to create a user
async function createUser(email, password) {
	try {
		const response = await axios.put("/users/create", {
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
		const response = await instance.get(`/users/verify/${user.uid}`, {
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

async function sendVerificationMail(email, uid, continueUrl) {
	try {
		const response = await axios.post("/users/send-verification-mail", {
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

// Function to check if the user is logged in and has a display name
function preEntryChecks() {
	return new Promise((resolve, reject) => {
		const unsubscribe = onAuthStateChanged(
			auth,
			(user) => {
				if (user) {
					const isLoggedIn = true;
					const isDisplayNameSet = user.displayName ? true : false;
					resolve({ isLoggedIn, isDisplayNameSet });
				} else {
					const isLoggedIn = false;
					const isDisplayNameSet = false;
					resolve({ isLoggedIn, isDisplayNameSet });
				}
				unsubscribe();
			},
			(error) => {
				reject(parseError(error));
			}
		);
	});
}

export { createUser, loginUser, logoutUser, preEntryChecks, sendVerificationMail };
