import { useEffect, useRef } from "react";
import { animated, useTransition } from "@react-spring/web";

import styles from "./Modal.module.scss";

const Modal = ({ children, show, closeModal }) => {
	const modalRef = useRef();

	useEffect(() => {
		const handleClose = (e) => {
			if (show && !modalRef.current.contains(e.target)) {
				closeModal();
			}
		};

		if (show) {
			document.addEventListener("mouseup", handleClose);
			document.addEventListener("keyup", (e) => {
				if (e.key === "Escape") {
					closeModal();
				}
			});
		}

		return () => {
			document.removeEventListener("mouseup", handleClose);
			document.removeEventListener("keyup", (e) => {
				if (e.key === "Escape") {
					closeModal();
				}
			});
		};
	}, [show, closeModal]);

	const transitions = useTransition(show, {
		from: { opacity: 0, scale: 0 },
		enter: { opacity: 1, scale: 1 },
		leave: { opacity: 0, scale: 0 },
		config: { tension: 300, friction: 20 },
	});

	return (
		<div>
			{transitions(
				(style, item) =>
					item && (
						<animated.div
							style={{ ...style, transformOrigin: "center" }}
							className={`${styles.modal} shift`}>
							<div ref={modalRef} className={styles.modalContent}>
								{children}
							</div>
						</animated.div>
					)
			)}
		</div>
	);
};

export { Modal };
