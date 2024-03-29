import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation, useOutletContext } from "react-router-dom";
import { Messages } from "./Messages/Messages";
import { MessageBoxHeader } from "./MessageBoxHeader/MessageBoxHeader";

import { useTransition, animated } from "@react-spring/web";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDoubleDown } from "@fortawesome/free-solid-svg-icons";

import styles from "./MessageBox.module.scss";
import MessageInput from "./MessageInput/MessageInput";

const MessageBox = () => {
	const messageBoxRef = useRef(null);
	const location = useLocation();
	let currentRoomId = location.pathname.split("/").pop();

	const [input, setInput] = useState("");
	const [groups, sendMessage] = useOutletContext();
	const [scrollState, setScrollState] = useState({ atTop: messageBoxRef.current?.scrollAtTop === 0, atBottom: true });

	function send(e) {
		e.preventDefault();
		if (input === "") return;
		sendMessage({ content: input, groupId: currentRoomId });
		setInput("");
	}

	useEffect(() => {
		messageBoxRef.current.scrollTop = messageBoxRef.current.scrollHeight;
	}, [groups]);

	const scrollListener = useCallback(() => {
		const atBottom = !(
			messageBoxRef.current.scrollTop + messageBoxRef.current.clientHeight <
			messageBoxRef.current.scrollHeight
		);
		const atTop = messageBoxRef.current.scrollTop === 0;
		setScrollState({ atTop, atBottom });
	}, []);

	const scrollIconAnim = useTransition(!scrollState.atBottom, {
		from: { opacity: 0, y: -20 },
		enter: { opacity: 1, y: 0 },
		leave: { opacity: 0, y: 20 },
		config: { duration: 200 },
	});

	return (
		<div className={styles.container}>
			<MessageBoxHeader group={groups[currentRoomId]} scrollAtTop={scrollState.scrollAtTop} />
			<div ref={messageBoxRef} className={styles.messageBox} onScroll={scrollListener}>
				<Messages group={groups[currentRoomId]} />
				{scrollIconAnim(
					(anim, item) =>
						item && (
							<animated.div
								style={anim}
								onClick={() => (messageBoxRef.current.scrollTop = messageBoxRef.current.scrollHeight)}
								className={styles.scrollDownIcon}>
								<FontAwesomeIcon icon={faAngleDoubleDown} />
							</animated.div>
						)
				)}
			</div>
			<MessageInput inputState={[input, setInput]} send={send} />
		</div>
	);
};

export { MessageBox };
