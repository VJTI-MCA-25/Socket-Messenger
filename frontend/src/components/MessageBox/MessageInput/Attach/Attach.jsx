import { useState, useEffect } from "react";
import { useTransition, animated } from "@react-spring/web";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperclip } from "@fortawesome/free-solid-svg-icons";
import { faLocationDot as faLD, faFile, faImage } from "@fortawesome/free-solid-svg-icons";

import { Modal, ImagesModal } from "barrel";

import M from "materialize-css";
import styles from "./Attach.module.scss";

function Attach() {
	const [showAttach, setShowAttach] = useState(false);
	const [modalContent, setModalContent] = useState(null);
	const [showModal, setShowModal] = useState(false);

	function closeModal() {
		setShowModal(false);
	}

	// This function handles the click event for the icons in the Attach Picker
	const onClickHandler = (id, e) => {
		switch (id) {
			case "location":
				console.log("Location");
				break;
			case "documents":
				console.log("Documents");
				break;
			case "images":
				setModalContent(<ImagesModal />);
				break;
			default:
				break;
		}

		setShowModal(true);
		setShowAttach(false);
	};

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
			<Modal show={showModal} closeModal={closeModal}>
				{modalContent}
			</Modal>
		</div>
	);
}

const Icon = ({ tooltip, id, onClickHandler, ...props }) => {
	return (
		<div
			onClick={(e) => {
				onClickHandler(id, e);
			}}
			className={`${styles.icon} z-depth-3 waves-effect waves-light tooltipped`}
			data-position="right"
			data-tooltip={tooltip}>
			<FontAwesomeIcon {...props} />
		</div>
	);
};

export { Attach };
