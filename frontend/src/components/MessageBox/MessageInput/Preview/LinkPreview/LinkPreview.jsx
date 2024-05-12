import styles from "./LinkPreview.module.scss";

const LinkPreview = ({ preview }) => {
	if (!preview.linkPreview) return null;
	if (!preview.linkPreview.title && !preview.linkPreview.description) return null;
	return (
		<div className={styles.preview}>
			{preview.linkPreview.imageUrl && (
				<img src={preview.linkPreview.imageUrl} alt="preview" className={styles.image} />
			)}
			<div>
				{preview.linkPreview.website && <span className={styles.website}>{preview.linkPreview.website}</span>}
				<div className={styles.title}>{preview.linkPreview.title}</div>
				<p>{preview.linkPreview.description}</p>
			</div>
		</div>
	);
};

export { LinkPreview };
