import { useState } from "react";
import { useLocation, useOutletContext } from "react-router-dom";
import { Messages } from "./Messages/Messages";

import styles from "./MessageBox.module.scss";

const MessageBox = () => {
	const [message, setMessage] = useState("");
	const location = useLocation();

	const [messages, sendMessage] = useOutletContext();

	let currentRoomId = location.pathname.split("/").pop();

	function send(e) {
		e.preventDefault();
		if (message === "") return;
		sendMessage({ content: message, groupId: currentRoomId });
		setMessage("");
	}

	return (
		<div className={styles.container}>
			<div className={styles.messageBox}>
				<Messages messages={messages[currentRoomId]} />
			</div>
			<form onSubmit={send} className={styles.inputContainer}>
				<input
					placeholder="Type your message here..."
					className={styles.input}
					type="text"
					onChange={(e) => setMessage(e.target.value)}
					value={message}
				/>
				<button type="submit" className={`${styles.sendButton} waves-effect waves-light btn`}>
					Send
				</button>
			</form>
		</div>
	);
};

export { MessageBox };
