import { useEffect, useState } from "react";
import styles from "./Media.module.scss";

const Media = ({ media }) => {
	const [show, setShow] = useState(false);

	function fullPreview() {
		setShow(true);
	}

	function closePreview() {
		setShow(false);
	}

	function getMediaElem() {
		switch (media.type) {
			case "gif":
				return <GifMedia media={media} fullPreview={fullPreview} />;
			case "link":
				return <LinkMedia media={media} />;
		}
	}

	return (
		<>
			{getMediaElem()}
			{show && <FullPreview media={media} closePreview={closePreview} />}
		</>
	);
};

const GifMedia = ({ media, fullPreview }) => {
	return <img src={media.preview} alt="gif" className={styles.gif} onClick={fullPreview} />;
};

const LinkMedia = ({ media }) => {
	return (
		<div className={styles.link}>
			<a href={media.url} target="_blank" rel="noreferrer">
				{media.url}
			</a>
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
