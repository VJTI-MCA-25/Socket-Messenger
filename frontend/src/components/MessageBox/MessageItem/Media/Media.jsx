const Media = ({ media, styles }) => {
	switch (media.type) {
		case "gif":
			return <img src={media.preview} alt="gif" className={styles.gif} />;
	}
};

export { Media };
