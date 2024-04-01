import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimesCircle } from "@fortawesome/free-regular-svg-icons";
import styles from "./Preview.module.scss";

const Preview = ({ preview, setPreview }) => {
	function previewElem() {
		switch (preview?.type) {
			case "gif":
				return <img src={preview.preview.url} alt="gif" />;
			case "link":
				if (preview?.linkPreview) {
					return <LinkPreview preview={preview} />;
				}
		}
	}

	return (
		<div className={`${styles.container} z-depth-3`}>
			<FontAwesomeIcon icon={faTimesCircle} className={styles.icon} onClick={() => setPreview(null)} />
			{previewElem()}
		</div>
	);
};

const LinkPreview = ({ preview }) => {
	if (!preview.linkPreview) return null;
	if (!preview.linkPreview.title && !preview.linkPreview.description) return null;
	return (
		<div className={styles.linkPreview}>
			{preview.linkPreview.imageUrl && (
				<img src={preview.linkPreview.imageUrl} alt="preview" className={styles.linkImage} />
			)}
			<div>
				{preview.linkPreview.website && <span className={styles.website}>{preview.linkPreview.website}</span>}
				<div className={styles.title}>{preview.linkPreview.title}</div>
				<p>{preview.linkPreview.description}</p>
			</div>
		</div>
	);
};

export { Preview };
