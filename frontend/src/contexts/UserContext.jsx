import { useState, useEffect, createContext } from "react";
import { PropTypes } from "prop-types";

import { useNavigate } from "react-router-dom";

import { auth } from "../services/firebase-config";
import { onAuthStateChanged } from "firebase/auth";

import { getUserData } from "../services/userFunctions";

const UserContext = createContext();

function UserContextProvider({ children }) {
	const [user, setUser] = useState(null);
	const navigate = useNavigate();

	useEffect(() => {
		onAuthStateChanged(auth, async (userRes) => {
			// Handle authentication state changes
			if (userRes) {
				// If user is authenticated
				try {
					// Attempt to fetch user data
					let userData = await getUserData(userRes);
					setUser({ ...userRes, userData });
				} catch (error) {
					setUser(null);
					//? This was causing a redirect from /auth/verify to /error
					if (error.statusText !== "auth/email-not-verified") {
						navigate("error", {
							state: { error: { code: error.code || 424, message: error.message || "Firebase Failure" } },
						});
					}
				}
			} else {
				// If user is not authenticated, set user to null
				setUser(null);
			}
		});
	}, [navigate]);
	return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

UserContextProvider.propTypes = {
	children: PropTypes.node.isRequired,
};

export { UserContextProvider, UserContext };
