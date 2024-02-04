import express from "express";
import { config } from "dotenv";
config();
import cors from "cors";

import { cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// Global variables
const app = express();

const PORT = process.env.PORT || 3000;

const serviceAccountKey = process.env.SERVICE_ACCOUNT_KEY;
initializeApp({
	credential: cert(serviceAccountKey),
});
const auth = getAuth();
const db = getFirestore();

const usersRef = db.collection("users");

// Express middleware

// CORS
app.use(
	cors({
		origin: "http://localhost:5173",
		methods: ["GET", "POST"],
		credentials: true,
		exposedHeaders: ["Authorization", "Content-Type"],
		allowedHeaders: ["Authorization", "Content-Type"],
	})
);

// body-parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

export { app, auth, db, usersRef, PORT };
