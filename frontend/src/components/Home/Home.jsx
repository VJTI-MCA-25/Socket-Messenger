import { useContext, useEffect, useState, useMemo } from "react";
import { Outlet, useNavigate } from "react-router-dom";

import { Sidenav } from "barrel";

import { UserContext } from "contexts/UserContext";
import { InvitesContextProvider } from "contexts/InvitesContext";
import { FriendsContextProvider } from "contexts/FriendsContext";
import { sockets } from "services/config";
import { getMessages } from "services/userFunctions";
import { Timestamp } from "firebase/firestore";
import { convertToFirebaseTimestamp, dateToString, processGroups } from "utilities/helperFunctions";

const Home = () => {
	const user = useContext(UserContext);
	const navigate = useNavigate();

	const [isNavOpen, setIsNavOpen] = useState(true);
	const [groups, setGroups] = useState({});
	const [groupDetails, setGroupDetails] = useState([]);

	useEffect(() => {
		if (!user) {
			navigate("/auth/login");
		}
	}, [user]);

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
				// Create a copy of the previous state
				let newState = JSON.parse(JSON.stringify(prev));

				// Extract groupId from messageData
				let { groupId } = messageData;

				// Convert sentAt to a Firebase timestamp and get the time and date string
				let timestamp = convertToFirebaseTimestamp(messageData.sentAt);
				let time = timestamp.toDate().getTime();
				let dateString = dateToString(timestamp);

				// Create a new message
				let newMessage = {
					...messageData,
					time,
					isUserSent: false,
				};

				// Add the new message to the correct date in the correct group
				if (!newState[groupId].messages[dateString]) {
					newState[groupId].messages[dateString] = [];
				}
				newState[groupId].messages[dateString].push(newMessage);

				// Return the new state
				return newState;
			});
		});

		return () => {
			sockets.messages.off("message receive");
		};
	}, []);

	function sendMessage(message) {
		// Generate a temporary id for the message
		// Optimistically add the message to the state
		let tempId = Math.random().toString(36).substring(7);
		let timestamp = Timestamp.now();
		let dateString = dateToString(timestamp);

		if (message.media) {
			switch (message.media.type) {
				case "gif":
					let { url, preview, type, ...rest } = message.media;
					message.media = { url, preview: preview.url, type };
					break;
				case "link":
					break;
				default:
					message.media = undefined;
					break;
			}
		}

		setGroups((prev) => {
			// Create a copy of the previous state
			let newState = JSON.parse(JSON.stringify(prev));

			// Create a new message
			let newMessage = {
				...message,
				isUserSent: true,
				time: timestamp,
				id: tempId,
			};

			// Add the new message to the correct date in the correct group
			if (!newState[message.groupId].messages[dateString]) {
				newState[message.groupId].messages[dateString] = [];
			}
			newState[message.groupId].messages[dateString].push(newMessage);

			// Return the new state
			return newState;
		});
		sockets.messages.emit("message send", message, (response) => {
			// Update the message with the id from the server
			setGroups((prev) => {
				let messages = [...prev[message.groupId].messages[dateString]];
				let index = messages.findIndex((msg) => msg.id === tempId);

				if (response.error) {
					messages[index] = { ...messages[index], error: true };
				} else {
					messages[index] = { ...messages[index], id: response.id, time: response.time };
				}

				return {
					...prev,
					[message.groupId]: {
						...prev[message.groupId],
						messages: {
							...prev[message.groupId].messages,
							[dateString]: messages,
						},
					},
				};
			});
		});
	}

	const groupDetailsMemo = useMemo(() => {
		return Object.keys(groups).map((groupId) => {
			let { messages, ...groupDetails } = groups[groupId];
			let keys = Object.keys(messages);
			let lastMessage =
				keys && keys.message ? messages[keys[keys.length - 1]][messages[keys[keys.length - 1]].length - 1] : {};
			return { ...groupDetails, groupId, lastMessage };
		});
	}, [groups]);

	useEffect(() => {
		setGroupDetails(groupDetailsMemo);
	}, [groupDetailsMemo]);

	if (user !== null) {
		// TODO Change to Props instead of context
		return (
			<FriendsContextProvider>
				<InvitesContextProvider>
					<Sidenav isNavOpen={isNavOpen} setIsNavOpen={setIsNavOpen} groupDetails={groupDetails} />
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
