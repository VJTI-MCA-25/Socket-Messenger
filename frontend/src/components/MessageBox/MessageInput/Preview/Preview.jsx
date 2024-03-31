import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimesCircle } from "@fortawesome/free-regular-svg-icons";
import styles from "./Preview.module.scss";

const Preview = ({ preview, setPreview }) => {
	function previewElem() {
		switch (preview?.type) {
			case "gif":
				return <img src={preview.preview.url} alt="gif" />;
		}
	}

	return (
		<div className={`${styles.container} z-depth-3`}>
			<FontAwesomeIcon icon={faTimesCircle} className={styles.icon} onClick={() => setPreview(null)} />
			<div className={styles.preview}>{previewElem()}</div>
		</div>
	);
};

export { Preview };
