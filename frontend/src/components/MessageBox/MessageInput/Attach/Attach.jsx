import { useState, useEffect } from "react";
import { useTransition, animated } from "@react-spring/web";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperclip } from "@fortawesome/free-solid-svg-icons";
import { faLocationDot as faLD, faFile, faImage } from "@fortawesome/free-solid-svg-icons";

import M from "materialize-css";
import styles from "./Attach.module.scss";

function Attach() {
	const [show, setShow] = useState(false);

	const onClickHandler = (id, e) => {
		switch (id) {
			case "location":
				console.log("Location");
				break;
			case "documents":
				console.log("Documents");
				break;
			case "images":
				console.log("Images");
				break;
			default:
				break;
		}
	};

	const attachToggle = useTransition(show, {
		from: { opacity: 0, scale: 0 },
		enter: { opacity: 1, scale: 1 },
		leave: { opacity: 0, scale: 0 },
		config: { tension: 300, friction: 20 },
	});

	useEffect(() => {
		const handleClickOutside = (e) => {
			if (e.target.closest(`.${styles.attach}`)) {
				return;
			}
			if (show && e.target.closest(`.${styles.container}`) === null) {
				setShow(false);
			}
		};

		if (show) {
			document.addEventListener("mouseup", handleClickOutside);
			document.addEventListener("keyup", (e) => {
				if (e.key === "Escape") {
					setShow(false);
				}
			});
			M.Tooltip.init(document.querySelectorAll(".tooltipped"), {}); // Initialize tooltips here
		} else {
			document.removeEventListener("mouseup", handleClickOutside);
		}
		return () => {
			document.removeEventListener("mouseup", handleClickOutside);
		};
	}, [show]);

	return (
		<div className={styles.main}>
			<FontAwesomeIcon
				icon={faPaperclip}
				className={`${styles.attach} ${show ? styles.active : ""}`}
				onClick={(e) => {
					e.stopPropagation();
					setShow(!show);
				}}
			/>
			{attachToggle(
				(anim, item) =>
					item && (
						<animated.div style={{ ...anim, transformOrigin: "bottom" }} className={styles.container}>
							<Icon
								onClickHandler={onClickHandler}
								icon={faLD}
								id="location"
								tooltip="Location"
								className={styles.location}
							/>
							<Icon
								onClickHandler={onClickHandler}
								icon={faFile}
								id="documents"
								tooltip="Documents"
								className={styles.file}
							/>
							<Icon
								onClickHandler={onClickHandler}
								icon={faImage}
								id="images"
								tooltip="Images"
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
			onClick={(e) => onClickHandler(id, e)}
			className={`${styles.icon} z-depth-3 waves-effect waves-light tooltipped`}
			data-position="right"
			data-tooltip={tooltip}>
			<FontAwesomeIcon {...props} />
		</div>
	);
};

export { Attach };
