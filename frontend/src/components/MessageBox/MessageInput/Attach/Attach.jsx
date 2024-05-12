import { useState, useEffect } from "react";
import { useTransition, animated } from "@react-spring/web";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperclip } from "@fortawesome/free-solid-svg-icons";
import { faLocationDot as faLD, faFile, faImage } from "@fortawesome/free-solid-svg-icons";

import { Modal } from "barrel";

import M from "materialize-css";
import styles from "./Attach.module.scss";

function Attach({ setMedia }) {
	const [showAttach, setShowAttach] = useState(false);

	function photosAndVideosHandler(e) {
		e.stopPropagation();

		function handleList(files) {
			files = Array.from(files);
			const media = files.map((file) => {
				return { file, type: file.type.split("/")[0] };
			});
			setMedia({ type: "list", list: media });
		}

		const fileInput = document.createElement("input");
		fileInput.type = "file";
		fileInput.accept =
			"image/jpeg, image/jpg, image/png, video/mp4, video/avi, video/3gp, video/wmv, video/mov, video/x-matroska, video/webm";
		fileInput.multiple = true;
		fileInput.onchange = (e) => {
			const files = e.target.files;
			if (files.length === 0) return;
			handleList(files);
		};
		fileInput.click();

		setShowAttach(false);
	}

	const attachToggle = useTransition(showAttach, {
		from: { opacity: 0, scale: 0 },
		enter: { opacity: 1, scale: 1 },
		leave: { opacity: 0, scale: 0 },
		config: { tension: 300, friction: 20 },
	});

	// Handles Click Outside for the Attach Picker
	useEffect(() => {
		const handleClickOutside = (e) => {
			if (e.target.closest(`.${styles.attach}`)) {
				return;
			}
			if (showAttach && e.target.closest(`.${styles.container}`) === null) {
				setShowAttach(false);
			}
		};

		if (showAttach) {
			document.addEventListener("mouseup", handleClickOutside);
			document.addEventListener("keyup", (e) => {
				if (e.key === "Escape") {
					setShowAttach(false);
				}
			});
			M.Tooltip.init(document.querySelectorAll(".tooltipped"), {}); // Initialize tooltips here
		} else {
			document.removeEventListener("mouseup", handleClickOutside);
		}
		return () => {
			document.removeEventListener("mouseup", handleClickOutside);
			document.querySelectorAll(".tooltipped").forEach((tooltip) => {
				const instance = M.Tooltip.getInstance(tooltip);
				if (instance) {
					instance.destroy();
				}
			});
		};
	}, [showAttach]);

	return (
		<div className={styles.main}>
			<FontAwesomeIcon
				icon={faPaperclip}
				className={`${styles.attach} ${showAttach ? styles.active : ""}`}
				onClick={(e) => {
					e.stopPropagation();
					setShowAttach(!showAttach);
				}}
			/>
			{attachToggle(
				(anim, item) =>
					item && (
						<animated.div style={{ ...anim, transformOrigin: "bottom" }} className={styles.container}>
							<Icon icon={faLD} id="location" tooltip="Location" className={styles.location} />
							<Icon icon={faFile} id="documents" tooltip="Documents" className={styles.file} />
							<Icon
								onClickHandler={photosAndVideosHandler}
								icon={faImage}
								id="images-and-videos"
								tooltip="Images & Videos"
								className={styles.image}
							/>
						</animated.div>
					)
			)}
		</div>
	);
}

const Icon = ({ tooltip, id, onClickHandler, ...props }) => {
	return (
		<div
			onClick={onClickHandler}
			className={`${styles.icon} z-depth-3 waves-effect waves-light tooltipped`}
			data-position="right"
			data-tooltip={tooltip}>
			<FontAwesomeIcon {...props} />
		</div>
	);
};

export { Attach };
