import { useContext, useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";

import { Sidenav } from "barrel";

import { UserContext } from "contexts/UserContext";
import { InvitesContextProvider } from "contexts/InvitesContext";
import { FriendsContextProvider } from "contexts/FriendsContext";
import { sockets } from "services/config";
import { getMessages } from "services/userFunctions";
import { Timestamp } from "firebase/firestore";
import { convertToFirebaseTimestamp, dateToString, processGroups } from "services/helperFunctions";

const Home = () => {
	const user = useContext(UserContext);
	const navigate = useNavigate();

	const [isNavOpen, setIsNavOpen] = useState(true);
	const [groups, setGroups] = useState({});

	useEffect(() => {
		(async () => {
			try {
				var groups = await getMessages();
				groups = processGroups(groups);
				setGroups(groups);
			} catch (error) {
				console.error(error);
			}
		})();

		sockets.messages.on("message receive", (messageData) => {
			setGroups((prev) => {
				let { groupId } = messageData;
				let timestamp = convertToFirebaseTimestamp(messageData.sentAt);
				let dateString = dateToString(timestamp);
				return {
					...prev,
					[groupId]: {
						...prev[groupId],
						messages: {
							...prev[groupId].messages,
							[dateString]: [
								...(prev[groupId].messages[dateString] || []),
								{ ...messageData, isUserSent: false, time: timestamp.toDate().getTime() },
							],
						},
					},
				};
			});
		});

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
		setGroups((prev) => {
			let timestamp = Timestamp.now();
			let dateString = dateToString(timestamp);
			return {
				...prev,
				[message.groupId]: {
					...prev[message.groupId],
					messages: {
						...prev[message.groupId].messages,
						[dateString]: [
							...(prev[message.groupId].messages[dateString] || []),
							{ ...message, isUserSent: true, time: timestamp.toDate().getTime() },
						],
					},
				},
			};
		});
	}

	if (user !== null) {
		return (
			<FriendsContextProvider>
				<InvitesContextProvider>
					<Sidenav isNavOpen={isNavOpen} setIsNavOpen={setIsNavOpen} />
					{/* Might change user to be passed in outlet context */}
					<main className={isNavOpen ? "shift" : ""}>
						<Outlet context={[groups, sendMessage]} />
					</main>
				</InvitesContextProvider>
			</FriendsContextProvider>
		);
	}
};

export { Home };
