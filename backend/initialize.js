import express from "express";
import { config } from "dotenv";
config();
import cors from "cors";

import { cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

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
});
const auth = getAuth();
const db = getFirestore();

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

const inviteIo = io.of("/invites");

inviteIo.use(async (socket, next) => {
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

const sockets = {
	inviteIo,
};

export { app, auth, db, usersRef, PORT, server, sockets, el, index };
