import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { sockets } from "services/config";

import styles from "./MessageBox.module.scss";

const MessageBox = () => {
	const [message, setMessage] = useState("");
	const location = useLocation();

	let currentRoomId = location.pathname.split("/").pop();

	useEffect(() => {
		sockets.messages.on("message receive", (message) => {
			console.log(message);
		});
		return () => {
			sockets.messages.off("message receive");
		};
	}, [sockets.messages]);

	function send() {
		sockets.messages.emit("message send", {
			groupId: currentRoomId,
			messageText: message,
		});
		setMessage("");
	}

	return (
		<div>
			<input type="text" onChange={(e) => setMessage(e.target.value)} value={message} />
			<button onClick={send}>Send</button>
		</div>
	);
};

export { MessageBox };
