import { useEffect, useState } from "react";
import { useTransition, animated, useSpring } from "@react-spring/web";
import { Tabs } from "barrel";
import GifPicker from "gif-picker-react";
import { TENOR_API_KEY } from "services/config";
import EmojiPicker from "@emoji-mart/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFaceSmile } from "@fortawesome/free-regular-svg-icons";
import styles from "./Picker.module.scss";

const Picker = ({ onGifSelect, onEmojiSelect }) => {
	const [show, setShow] = useState(false);

	useEffect(() => {
		const handleClickOutside = (e) => {
			if (e.target.closest(`.${styles.button}`)) return;
			if (show && e.target.closest(`.${styles.container}`) === null) {
				setShow(false);
			}
		};

		if (show) {
			document.addEventListener("mouseup", handleClickOutside);
			document.addEventListener("keyup", (e) => {
				if (e.key === "Escape") setShow(false);
			});
		} else {
			document.removeEventListener("mouseup", handleClickOutside);
		}
		return () => {
			document.removeEventListener("mouseup", handleClickOutside);
		};
	}, [show]);

	const pickerToggle = useTransition(show, {
		from: { opacity: 0, scale: 0 },
		enter: { opacity: 1, scale: 1 },
		leave: { opacity: 0, scale: 0 },
		config: { tension: 300, friction: 20 },
	});

	const tabsList = [
		{
			tab: "Emoji",
			panel: (
				<div className={styles.window}>
					<EmojiPicker
						previewPosition="none"
						skinTonePosition="search"
						showPreview={false}
						onEmojiSelect={onEmojiSelect}
					/>
				</div>
			),
		},
		{
			tab: "GIF",
			panel: (
				<div className={styles.window}>
					<GifPicker
						tenorApiKey={TENOR_API_KEY}
						onGifClick={(e) => {
							setShow(false);
							onGifSelect(e);
						}}
					/>
				</div>
			),
		},
	];

	return (
		<div className={styles.main}>
			<FontAwesomeIcon
				icon={faFaceSmile}
				onClick={() => setShow(!show)}
				className={`${styles.button} ${show ? styles.open : ""}`}
			/>
			{pickerToggle(
				(anim, item) =>
					item && (
						<animated.div
							style={{ ...anim, transformOrigin: "bottom left" }}
							className={`${styles.container} z-depth-3`}>
							<Tabs list={tabsList} tabsPosition="top" />
						</animated.div>
					)
			)}
		</div>
	);
};

export { Picker };
