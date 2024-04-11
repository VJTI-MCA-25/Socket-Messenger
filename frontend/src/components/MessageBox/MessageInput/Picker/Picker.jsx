import { useEffect, useRef, useState } from "react";
import { useTransition, animated } from "@react-spring/web";

import GifPicker from "gif-picker-react";
import { TENOR_API_KEY } from "services/config";

import EmojiPicker from "@emoji-mart/react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFaceSmile } from "@fortawesome/free-regular-svg-icons";

import styles from "./Picker.module.scss";

const Picker = ({ onGifSelect, onEmojiSelect }) => {
	const [show, setShow] = useState(false);
	const [activeTab, setActiveTab] = useState("emoji");

	const pickerToggle = useTransition(show, {
		from: { opacity: 0, scale: 0 },
		enter: { opacity: 1, scale: 1 },
		leave: { opacity: 0, scale: 0 },
		config: { tension: 300, friction: 20 },
	});

	useEffect(() => {
		const handleClickOutside = (e) => {
			if (e.target.closest(`.${styles.button}`)) {
				return;
			}
			if (show && e.target.closest(`.${styles.container}`) === null) {
				setShow(false);
			}
		};

		if (show) {
			document.addEventListener("mouseup", handleClickOutside);
		} else {
			document.removeEventListener("mouseup", handleClickOutside);
		}
		return () => {
			document.removeEventListener("mouseup", handleClickOutside);
		};
	}, [show]);

	return (
		<>
			<FontAwesomeIcon
				icon={faFaceSmile}
				onClick={(e) => {
					e.stopPropagation();
					setShow(!show);
				}}
				className={`${styles.button} ${show ? styles.active : ""}`}
			/>
			{pickerToggle(
				(anim, item) =>
					item && (
						<animated.div
							style={{ ...anim, transformOrigin: "bottom left" }}
							className={`${styles.container} z-depth-3`}>
							<div className={styles.tabs}>
								<div
									className={`${styles.tab} ${activeTab === "emoji" ? styles.active : ""}`}
									onClick={() => setActiveTab("emoji")}>
									Emoji
								</div>
								<div
									className={`${styles.tab} ${activeTab === "gif" ? styles.active : ""}`}
									onClick={() => setActiveTab("gif")}>
									GIF
								</div>
							</div>
							<div className={styles.window}>
								{activeTab === "gif" && (
									<GifPicker
										tenorApiKey={TENOR_API_KEY}
										onGifClick={(e) => {
											setShow(false);
											onGifSelect(e);
										}}
									/>
								)}
								{activeTab === "emoji" && (
									<EmojiPicker
										previewPosition="none"
										skinTonePosition="search"
										showPreview={false}
										onEmojiSelect={onEmojiSelect}
									/>
								)}
							</div>
						</animated.div>
					)
			)}
		</>
	);
};

export { Picker };
