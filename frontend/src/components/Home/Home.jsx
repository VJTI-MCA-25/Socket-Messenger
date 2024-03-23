import { useContext, useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";

import { Sidenav } from "barrel";

import { UserContext } from "contexts/UserContext";
import { InvitesContextProvider } from "contexts/InvitesContext";
import { FriendsContextProvider } from "contexts/FriendsContext";
import { sockets } from "services/config";
import { getMessages } from "services/userFunctions";

const Home = () => {
	const user = useContext(UserContext);
	const navigate = useNavigate();

	const [isNavOpen, setIsNavOpen] = useState(true);
	const [messages, setMessages] = useState({});

	useEffect(() => {
		try {
			(async () => {
				const messages = await getMessages();
				setMessages(messages);
				console.log(messages);
			})();

			sockets.messages.on("message receive", (message) => {
				setMessages((prev) => prev[message.groupId].messages.push(message));
			});
		} catch (error) {
			console.error(error);
		}

		return () => {
			sockets.messages.off("message receive");
		};
	}, []);

	useEffect(() => {
		if (!user) {
			navigate("/auth/login");
		}
	}, [user]);

	function sendMessage(message) {
		sockets.messages.emit("message send", message);
		setMessages((prev) => prev[message.groupId].messages.push(message));
	}

	if (user !== null) {
		return (
			<FriendsContextProvider>
				<InvitesContextProvider>
					<Sidenav isNavOpen={isNavOpen} setIsNavOpen={setIsNavOpen} />
					{/* Might change user to be passed in outlet context */}
					<main className={isNavOpen ? "shift" : ""}>
						<Outlet />
					</main>
				</InvitesContextProvider>
			</FriendsContextProvider>
		);
	}
};

export { Home };
