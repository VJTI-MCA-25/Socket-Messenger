import { useContext, useEffect, useState, useMemo } from "react";
import { Outlet, useNavigate } from "react-router-dom";

import { Sidenav } from "barrel";

import { UserContext } from "contexts/UserContext";
import { InvitesContextProvider } from "contexts/InvitesContext";
import { FriendsContextProvider } from "contexts/FriendsContext";
import { sockets } from "services/config";
import { getMessages, uploadMedia } from "services/messageFunctions";
import { Timestamp } from "firebase/firestore";
import { convertToFirebaseTimestamp, dateToString, processGroups } from "helperFunctions";

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

	function uploadProgressHandler(progressEvent) {
		let percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
		console.log(percentCompleted);
	}

	/** This function will be used to upload media to the server
	 * Whenever a message with media that needs to be uploaded is sent,
	 * First the UI will be updated optimistically
	 * Then this function will be called to upload the media
	 */
	async function uploadAndSend(message, tempId) {
		try {
			const response = await uploadMedia(message.media.file, message.groupId, uploadProgressHandler);
			const media = { type: message.media.type, url: response.url, fileName: message.media.file.name };

			sockets.messages.emit("message send", { ...message, media }, (response) => {
				// If there is an error, log it
				if (response.error) {
					console.error(response.error);
					return;
				}

				const dateString = dateToString(response.time);

				// Update the message with the id from the server
				setGroups((prev) => {
					let messages = [...prev[message.groupId].messages[dateString]];
					let index = messages.findIndex((msg) => msg.id === tempId);

					if (response.error) {
						messages[index] = { ...messages[index], error: true };
					} else {
						messages[index] = { ...messages[index], id: response.id, time: response.time };
						message.media.loading = false;
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

				// this is the callback function
			});
		} catch (error) {
			console.error(error);
		}
	}

	function sendMessage(message) {
		// Generate a temporary id for the message
		// Optimistically add the message to the state
		let tempId = Math.random().toString(36).substring(7).concat("-temp");
		let timestamp = Timestamp.now();
		let dateString = dateToString(timestamp);

		if (message.media) {
			if (message.media.type === "gif") {
				let { url, preview, type, ...rest } = message.media;
				message.media = { url, preview: preview.url, type };
			} else if (message.media.type === "link") {
				let { linkPreview, ...rest } = message.media;
				message.media = { ...linkPreview, ...rest };
			} else if (message.media.type === "image") {
				message.needsUpload = true;
				message.media.loading = true;
			} else {
				message.media = undefined;
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

		if (message.needsUpload) {
			uploadAndSend(message, tempId);
			return;
		}

		sockets.messages.emit("message send", message, (response) => {
			// this is the callback function

			// If there is an error, log it
			// TODO: Handle the error
			if (response.error) {
				console.error(response.error);
				return;
			}
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
