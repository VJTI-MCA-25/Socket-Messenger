import express from "express";
import { config } from "dotenv";
config();
import cors from "cors";

import { cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

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

const inviteIo = io.of("/invites");
const sockets = {
	inviteIo,
};

export { app, auth, db, usersRef, PORT, server, sockets };
