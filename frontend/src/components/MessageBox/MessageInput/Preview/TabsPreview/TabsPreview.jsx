import { useState, useEffect } from "react";

import { Tabs } from "barrel";

import styles from "./TabsPreview.module.scss";
import { bytesToSize, getVideoThumbnail } from "utilities/helperFunctions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileVideo } from "@fortawesome/free-solid-svg-icons";

const TabsPreview = ({ files }) => {
	const [media, setMedia] = useState([]);
	const [tabs, setTabs] = useState([]);

	const acceptedTypes = [
		"image/jpeg",
		"image/jpg",
		"image/png",
		"video/mp4",
		"video/avi",
		"video/3gp",
		"video/wmv",
		"video/mov",
		"video/x-matroska",
		"video/webm",
	];

	useEffect(() => {
		const generateMedia = async () => {
			const newMedia = [];
			for (const [index, file] of files.entries()) {
				if (!acceptedTypes.includes(file.file.type)) continue;

				const media = {
					blob: file.file,
					url: file.url,
					type: file.type,
					name: file.file.name,
					size: file.file.size,
					key: index,
				};

				if (file.type === "video") {
					try {
						const thumbnail = await getVideoThumbnail(media);
						media.thumbnailUrl = thumbnail;
					} catch (error) {
						console.error(error);
					}
				}
				newMedia.push(media);
			}
			setMedia(newMedia);
		};

		generateMedia();
	}, [files]);

	useEffect(() => {
		const tabs = media.map((file) => ({
			tab: (
				<div style={{ height: 30, width: 30, display: "grid", placeItems: "center" }}>
					{file.type === "video" ? (
						<FontAwesomeIcon icon={faFileVideo} size="lg" />
					) : (
						<img src={file.thumbnailUrl || file.url} alt={file.name} height={30} width={30} />
					)}
				</div>
			),
			panel:
				file.type === "video" ? (
					<div className={styles.videoContainer}>
						{file?.thumbnailUrl ? (
							<img src={file.thumbnailUrl} alt={file.name} className={styles.thumbnail} />
						) : (
							<FontAwesomeIcon icon={faFileVideo} className={styles.videoIcon} size="5x" />
						)}
						<div className={styles.videoDetails}>
							<div className={styles.videoName}>{file.name}</div>
							<div className={styles.size}>{bytesToSize(file.size)}</div>
						</div>
					</div>
				) : (
					<img src={file.url} alt={file.name} className={styles.panelImage} />
				),
		}));

		setTabs(tabs);
	}, [media]);

	if (media.length === 0) {
		return null;
	}

	return (
		<div className={styles.container}>
			<Tabs list={tabs} />
		</div>
	);
};

export { TabsPreview };
