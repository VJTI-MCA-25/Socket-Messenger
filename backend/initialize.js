import express from "express";
import { config } from "dotenv";
config();
import cors from "cors";

import { cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

import { decodeAndVerify } from "./serverHelperFunctions.js";

import { createServer } from "http";
import { Server } from "socket.io";

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

// Express middleware

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
	//TODO Change this logic to use a id token
	const token = socket.handshake.auth.token;
	if (!token) next(new Error("auth/missing-token"));

	const [verifiedStatus, user] = await decodeAndVerify(token);
	if (verifiedStatus === -1) next(new Error("auth/unauthorized"));
	else {
		socket.user = user;
		socket.verifiedStatus = verifiedStatus;
		next();
	}
});

const sockets = {
	inviteIo,
};

export { app, auth, db, usersRef, PORT, server, sockets };
