import { useState, useEffect, createContext } from "react";
import { PropTypes } from "prop-types";

import { auth } from "../services/firebase-config";
import { onAuthStateChanged } from "firebase/auth";

// import { getUserData } from "../services/userFunctions";

const UserContext = createContext();

function UserContextProvider({ children }) {
	const [user, setUser] = useState(null);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (userRes) => {
			// Handle authentication state changes
			if (userRes) {
				setUser(userRes);
			} else {
				// If user is not authenticated, set user to null
				setUser(null);
			}
		});

		// Cleanup subscription
		return () => unsubscribe();
	}, []);
	return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

UserContextProvider.propTypes = {
	children: PropTypes.node.isRequired,
};

export { UserContextProvider, UserContext };
