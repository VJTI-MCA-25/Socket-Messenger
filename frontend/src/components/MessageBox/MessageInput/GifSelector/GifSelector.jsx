import { useEffect, useState } from "react";
import { useTransition, animated } from "@react-spring/web";
import GifPicker from "gif-picker-react";
import { TENOR_API_KEY } from "services/config";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFaceSmile } from "@fortawesome/free-regular-svg-icons";

import styles from "./GifSelector.module.scss";

const GifSelector = ({ onGifSelect }) => {
	const [show, setShow] = useState(false);

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
							<GifPicker tenorApiKey={TENOR_API_KEY} onGifClick={onGifSelect} />
						</animated.div>
					)
			)}
		</>
	);
};

export { GifSelector };
