import { useState } from "react";
import { useLocation, useOutletContext } from "react-router-dom";
import { Messages } from "./Messages/Messages";

import styles from "./MessageBox.module.scss";

const MessageBox = () => {
	const [input, setInput] = useState("");
	const location = useLocation();

	const [groups, sendMessage] = useOutletContext();

	let currentRoomId = location.pathname.split("/").pop();

	function send(e) {
		e.preventDefault();
		if (input === "") return;
		sendMessage({ content: input, groupId: currentRoomId });
		setInput("");
	}

	return (
		<div className={styles.container}>
			<div className={styles.messageBox}>
				<Messages group={groups[currentRoomId]} />
			</div>
			<form onSubmit={send} className={styles.inputContainer}>
				<input
					placeholder="Type your message here..."
					className={styles.input}
					type="text"
					onChange={(e) => setInput(e.target.value)}
					value={input}
				/>
				<button type="submit" className={`${styles.sendButton} waves-effect waves-light btn`}>
					Send
				</button>
			</form>
		</div>
	);
};

export { MessageBox };
