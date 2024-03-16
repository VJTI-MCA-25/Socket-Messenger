import { useState, useEffect, createContext } from "react";
import { PropTypes } from "prop-types";
import { sockets } from "projectConfig";

const InvitesContext = createContext();

function InvitesContextProvider({ children }) {
	const [invites, setInvites] = useState([]);

	useEffect(() => {
		sockets.invitations.connect();
		sockets.invitations.on("invites", (data) => {
			setInvites(data);
		});
		return () => {
			setInvites([]);
			sockets.invitations.off("invites");
			sockets.invitations.disconnect();
		};
	}, []);

	return <InvitesContext.Provider value={invites}>{children}</InvitesContext.Provider>;
}

InvitesContextProvider.propTypes = {
	children: PropTypes.node.isRequired,
};

export { InvitesContextProvider, InvitesContext };
