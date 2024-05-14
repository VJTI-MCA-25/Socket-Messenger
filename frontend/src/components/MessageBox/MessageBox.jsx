import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation, useOutletContext } from "react-router-dom";
import { hasValidUrl, getLinksFromString } from "helperFunctions";
import { getLinkPreview } from "services/messageFunctions";

import { Messages } from "./Messages/Messages";
import { MessageBoxHeader } from "./MessageBoxHeader/MessageBoxHeader";

import { useTransition, animated } from "@react-spring/web";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDoubleDown } from "@fortawesome/free-solid-svg-icons";

import { init, SearchIndex } from "emoji-mart";
import data from "@emoji-mart/data";

import styles from "./MessageBox.module.scss";
import MessageInput from "./MessageInput/MessageInput";

const MessageBox = () => {
	init({ data });
	const messageBoxRef = useRef(null);
	const location = useLocation();
	let currentRoomId = location.pathname.split("/").pop();

	const [input, setInput] = useState("");
	const [media, setMedia] = useState(null);
	const [groups, sendMessage] = useOutletContext();
	const [scrollState, setScrollState] = useState({ atTop: messageBoxRef.current?.scrollAtTop === 0, atBottom: true });

	useEffect(() => {
		const shortCodes = input.match(/:[a-zA-Z0-9_]+:/g);
		if (shortCodes) {
			shortCodes.forEach(async (shortCode) => {
				let code = shortCode.replace(/:/g, "");
				const emoji = await SearchIndex.search(code);
				if (emoji.length > 0) setInput(input.replace(shortCode, emoji[0].skins[0].native));
			});
		}

		const timer = setTimeout(async () => {
			if (media && media.type === "list") return;
			if (input === "") return setMedia(null);
			if (!hasValidUrl(input)) return;
			try {
				let links = getLinksFromString(input);
				let linkPreview = await getLinkPreview(links[0]);
				setMedia({ linkPreview, content: input, type: "link", url: input });
			} catch (error) {
				console.error(error);
			}
		}, 500);

		return () => {
			if (timer) clearTimeout(timer);
		};
	}, [input]);

	function onEmojiSelect(emoji) {
		setInput(input + emoji.native);
	}

	function send(e) {
		e.preventDefault();

		if (!input && !media) return;

		const baseMessage = { content: input, groupId: currentRoomId };

		if (media?.type === "list") {
			media.list.forEach((mediaItem) => {
				const newMessage = { ...baseMessage, media: mediaItem };
				sendMessage(newMessage);
			});
		} else {
			const newMessage = media ? { ...baseMessage, media } : baseMessage;
			sendMessage(newMessage);
		}

		setInput("");
		setMedia(null);
	}

	function onGifSelect(gif) {
		gif.type = "gif";
		setMedia(gif);
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

	function shouldDisableInput() {
		let status = false;
		if (media && media.type === "list" && media.list.length > 1) status = true;
		return status;
	}

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
			<MessageInput
				input={input}
				setInput={setInput}
				send={send}
				media={media}
				setMedia={setMedia}
				onGifSelect={onGifSelect}
				onEmojiSelect={onEmojiSelect}
				disableInput={shouldDisableInput()}
			/>
		</div>
	);
};

export { MessageBox };
