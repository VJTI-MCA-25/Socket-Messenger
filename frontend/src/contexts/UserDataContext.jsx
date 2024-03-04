import { useEffect, createContext, useState, useContext } from "react";
import { PropTypes } from "prop-types";
import { UserContext } from "./UserContext";
import { getUserData } from "../services/userFunctions";

const UserDataContext = createContext();

function UserDataContextProvider({ children }) {
	const [userData, setUserData] = useState(null);
	const user = useContext(UserContext);

	useEffect(() => {
		if (user) {
			(async () => {
				try {
					let data = await getUserData(user);
					setUserData(data);
				} catch (error) {
					console.log(error);
				}
			})();
		} else setUserData(null);
	}, [user]);

	return <UserDataContext.Provider value={userData}>{children}</UserDataContext.Provider>;
}

UserDataContextProvider.propTypes = {
	children: PropTypes.node.isRequired,
};

export { UserDataContextProvider, UserDataContext };
