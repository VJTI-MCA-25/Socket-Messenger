import { useState } from "react";
import styles from "./Media.module.scss";

const Media = ({ media }) => {
	const [show, setShow] = useState(false);

	const fullPreview = () => setShow(true);
	const closePreview = () => setShow(false);

	function getMediaElem() {
		switch (media.type) {
			case "gif":
				return <GifMedia media={media} fullPreview={fullPreview} />;
			case "link":
				return <LinkMedia media={media} />;
		}
	}

	return (
		<div className={styles.container}>
			{getMediaElem()}
			{show && <FullPreview media={media} closePreview={closePreview} />}
		</div>
	);
};

const GifMedia = ({ media, fullPreview }) => {
	return <img src={media.preview} alt="gif" className={styles.gif} onClick={fullPreview} />;
};

const LinkMedia = ({ media }) => {
	function getMedia() {
		if (media.isVideo) {
			if (media.isVideoEmbed) {
				return (
					<iframe
						src={media.videoUrl}
						title={media.title}
						className={styles.linkEmbed}
						frameBorder="0"
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share;"
						referrerPolicy="strict-origin-when-cross-origin"
						sandbox="allow-scripts allow-same-origin allow-popups allow-presentation"
						allowFullScreen></iframe>
				);
			} else {
				return <video src={media.url} controls className={styles.linkVideo} />;
			}
		} else {
			return <img src={media.imageUrl} alt="link" className={styles.linkImage} />;
		}
	}

	return (
		<div className={styles.link}>
			{/* <a href={media.url} className={styles.linkAnchor} target="_blank" rel="noreferrer"> */}
			{getMedia()}
			<div className={styles.linkContent}>
				{media?.website && <div className={styles.linkWebsite}>{media.website}</div>}
				<div className={styles.linkTitle}>{media.title}</div>
				<div className={styles.linkDescription}>{media.description}</div>
			</div>
			{/* </a> */}
		</div>
	);
};

const FullPreview = ({ media, closePreview }) => {
	return (
		<div className={styles.fullPreview} onClick={closePreview}>
			<img src={media.url} className={styles[media.type]} alt="full preview" />
		</div>
	);
};

export { Media };
