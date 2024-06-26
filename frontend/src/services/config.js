import firebaseConfig from "./firebase-config";

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { Manager } from "socket.io-client";
import { getAuthToken } from "./authFunctions";

import axios from "axios";
// import { getAnalytics } from "firebase/analytics";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();
// const analytics = getAnalytics(app);

// Api base url

const url = "http://localhost:3000";
const baseURL = url + "/api";

// Socket.io Config
const manager = new Manager(url, {
	transports: ["websocket"],
});

const invitations = manager.socket("/invites", {
	autoConnect: false,
	auth: async (cb) => {
		const token = await getAuthToken();
		cb({ token });
	},
});

const friends = manager.socket("/friends", {
	autoConnect: false,
	auth: async (cb) => {
		const token = await getAuthToken();
		cb({ token });
	},
});

const messages = manager.socket("/messages", {
	auth: async (cb) => {
		const token = await getAuthToken();
		cb({ token });
	},
});

const sockets = {
	invitations,
	friends,
	messages,
};

// Axios Config
const instance = axios.create({
	baseURL: baseURL,
});

instance.interceptors.request.use(async (config) => {
	try {
		const token = await getAuthToken();
		config.headers.Authorization = token;
		return config;
	} catch (error) {
		console.error(error);
	}
});

const TENOR_API_KEY = "AIzaSyBLFpR-2M13iTS1RmDYIPho0X-UO9tWDLY";

export { app, auth, db, baseURL, manager, instance, sockets, TENOR_API_KEY };
