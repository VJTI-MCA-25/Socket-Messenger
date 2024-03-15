// import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider, Outlet, redirect } from "react-router-dom";

import { Home, Error, Auth, Friends, Misc, Profile } from "barrel";

import { preEntryChecks } from "services/authFunctions";

import App from "./App.jsx";
import "./main.scss";

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
					let report = await preEntryChecks();
					if (!report.isLoggedIn) return redirect("/auth/login");
					else if (!report.isDisplayNameSet) return redirect("/display-name");
					else return null;
				},
				children: [
					{
						path: "friends",
						index: true,
						element: <Friends />,
					},
					{
						path: "profile",
						element: <Profile />,
						loader: async () => {
							let report = await preEntryChecks();
							if (!report.isLoggedIn) return redirect("/auth/login");
							else if (!report.isDisplayNameSet) return redirect("/display-name");
							else return null;
						},
					},
				],
			},

			{
				path: "auth",
				element: <Outlet />,
				children: [
					{
						// This path is for when the user goes to /auth
						index: true,
						loader: async () => redirect("/auth/login"),
					},
					{
						path: "login",
						loader: async () => {
							let report = await preEntryChecks();
							if (report.isLoggedIn) return redirect("/channels");
							else return null;
						},
						element: <Auth.Login />,
					},
					{
						path: "signup",
						element: <Auth.Signup />,
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
				path: "display-name",
				loader: async () => {
					let report = await preEntryChecks();
					if (!report.isLoggedIn) return redirect("/auth/login");
					else if (report.isDisplayNameSet) return redirect("/channels");
					else return null;
				},
				element: <Misc.DisplayName />,
			},
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
