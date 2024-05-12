import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

import { LinkPreview } from "./LinkPreview/LinkPreview";
import { TabsPreview } from "./TabsPreview/TabsPreview";

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
			case "list":
				let files = preview.list;
				return <TabsPreview files={files} />;
		}
	}

	return (
		<div className={`${styles.container} z-depth-3`}>
			<div className={styles.controls}>
				<FontAwesomeIcon icon={faTimes} className={styles.icon} onClick={() => setPreview(null)} />
			</div>
			{previewElem()}
		</div>
	);
};

export { Preview };
