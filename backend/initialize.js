import express from "express";
import { config } from "dotenv";
config();
import cors from "cors";

import { cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

import { createServer } from "http";
import { Server } from "socket.io";

import el from "./errorList.json" assert { type: "json" };
import { decodeAndVerify } from "./serverHelperFunctions.js";

import algoliasearch from "algoliasearch";

// Global variables
const app = express();

const PORT = process.env.PORT || 3000;

const serviceAccountKey = process.env.SERVICE_ACCOUNT_KEY;
initializeApp({
	credential: cert(serviceAccountKey),
	storageBucket: "gs://discord-clone-d2f37.appspot.com",
});
const auth = getAuth();
const db = getFirestore();
const bucket = getStorage().bucket();

db.settings({ ignoreUndefinedProperties: true });

const usersRef = db.collection("users");

// Algolia
const APP_ID = process.env.ALGOLIA_APP_ID;
const SEARCH_KEY = process.env.ALGOLIA_SEARCH_KEY;

const algoliaClient = algoliasearch(APP_ID, SEARCH_KEY);
const index = algoliaClient.initIndex("fuzzy_search");

// Express middleware

//TODO Check if CORS is working properly with socket.io
// CORS
app.use(
	cors({
		origin: "http://localhost:5173",
		methods: ["GET", "POST", "PUT"],
		credentials: true,
		exposedHeaders: ["Authorization", "Content-Type"],
		allowedHeaders: ["Authorization", "Content-Type"],
	})
);

// body-parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const server = createServer(app);
const io = new Server(server);

/* Socket Middleware - (Decode Token) */
io.on("new_namespace", (nsp) => {
	nsp.use(async (socket, next) => {
		const token = socket.handshake.auth.token;
		try {
			let user = await decodeAndVerify(token, false); // Disabled database check, might slow down the socket connection, idk
			socket.user = user;
			next();
		} catch (error) {
			//TODO - Handle error (Frontend should handle this)
			console.log(error);
		}
	});
});

const sockets = {
	inviteIo: io.of("/invites"),
	friendsIo: io.of("/friends"),
};

export { app, auth, db, usersRef, PORT, server, sockets, el, index, bucket };
