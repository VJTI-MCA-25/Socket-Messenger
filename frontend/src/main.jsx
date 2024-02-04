// import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider, Outlet, redirect } from "react-router-dom";

import { Home, Error, Login, Signup, Friends, Misc } from "./components/Components";

import { checkLogin } from "./services/authFunctions";

import App from "./App.jsx";
import "./index.css";

const router = createBrowserRouter([
	{
		path: "/",
		element: <App />,
		errorElement: <Error />,
		children: [
			{
				index: true,
				loader: async () => redirect("/channels"),
			},
			{
				path: "channels",
				element: <Home />,
				loader: async () => {
					let isLoggedIn = await checkLogin();
					if (!isLoggedIn) {
						return redirect("/auth/login");
					} else return null;
				},
				children: [
					{
						path: "friends",
						index: true,
						element: <Friends />,
					},
				],
			},
			{
				path: "auth",
				element: (
					<div className="container">
						<Outlet />
					</div>
				),
				children: [
					{
						// This path is for when the user goes to /auth
						index: true,
						loader: async () => redirect("/auth/login"),
					},
					{
						path: "login",
						element: <Login />,
					},
					{
						path: "signup",
						element: <Signup />,
					},
					{
						path: "verify",
						element: <Misc.VerifyEmail />,
					},
				],
			},
			...["login", "signin"].map((path) => ({
				path: "auth?/" + path,
				loader: async () => redirect("/auth/login"),
			})),
			...["signup", "register"].map((path) => ({
				path: "auth?/" + path,
				loader: async () => redirect("/auth/signup"),
			})),
			{
				path: "error",
				element: <Error />,
			},
		],
	},
]);

ReactDOM.createRoot(document.getElementById("root")).render(
	// <React.StrictMode>
	<RouterProvider router={router} />
	// </React.StrictMode>
);
