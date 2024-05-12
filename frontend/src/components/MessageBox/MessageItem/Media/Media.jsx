import { useState } from "react";
import styles from "./Media.module.scss";

// Media component
const Media = ({ media }) => {
	const [show, setShow] = useState(false);

	const fullPreview = () => setShow(true);
	const closePreview = () => setShow(false);

	// Function to determine which media element to render
	const getMediaElem = () => {
		switch (media.type) {
			case "gif":
				return <GifMedia media={media} fullPreview={fullPreview} />;
			case "link":
				return <LinkMedia media={media} />;
			default:
				return null;
		}
	};

	return (
		<div className={styles.container}>
			{getMediaElem()}
			{show && <FullPreview media={media} closePreview={closePreview} />}
		</div>
	);
};

// GifMedia component
const GifMedia = ({ media, fullPreview }) => (
	<img src={media.preview} alt="gif" className={styles.gif} onClick={fullPreview} />
);

// LinkMedia component
const LinkMedia = ({ media }) => {
	const getMedia = () => {
		if (media.isVideo) {
			return media.isVideoEmbed ? (
				<iframe
					src={media.videoUrl}
					title={media.title}
					className={styles.linkEmbed}
					frameBorder="0"
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share;"
					referrerPolicy="strict-origin-when-cross-origin"
					sandbox="allow-scripts allow-same-origin allow-popups allow-presentation"
					allowFullScreen
				/>
			) : (
				<video src={media.url} controls className={styles.linkVideo} />
			);
		} else {
			return <img src={media.imageUrl} alt="link" className={styles.linkImage} />;
		}
	};

	const mediaElem = getMedia();
	const isImage = mediaElem.type === "img";

	return (
		<div className={`${styles.link} ${isImage ? styles.imageLink : ""}`}>
			{mediaElem}
			<div className={styles.linkContent}>
				{media.website && <div className={styles.linkWebsite}>{media.website}</div>}
				<div className={styles.linkTitle}>{media.title}</div>
				<div className={styles.linkDescription}>{media.description}</div>
			</div>
		</div>
	);
};

// FullPreview component
const FullPreview = ({ media, closePreview }) => (
	<div className={styles.fullPreview} onClick={closePreview}>
		<img src={media.url} className={styles[media.type]} alt="full preview" />
	</div>
);

export { Media };
