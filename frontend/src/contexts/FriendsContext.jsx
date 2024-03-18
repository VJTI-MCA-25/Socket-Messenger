import { useState, useEffect, createContext } from "react";
import { PropTypes } from "prop-types";
import { sockets } from "projectConfig";

const FriendsContext = createContext();

function FriendsContextProvider({ children }) {
	const [friends, setFriends] = useState([]);

	useEffect(() => {
		sockets.friends.connect();
		sockets.friends.on("friends", (data) => {
			setFriends(data);
		});
		return () => {
			setFriends([]);
			sockets.friends.off("friends");
			sockets.friends.disconnect();
		};
	}, []);

	return <FriendsContext.Provider value={friends}>{children}</FriendsContext.Provider>;
}

FriendsContextProvider.propTypes = {
	children: PropTypes.node.isRequired,
};

export { FriendsContextProvider, FriendsContext };
