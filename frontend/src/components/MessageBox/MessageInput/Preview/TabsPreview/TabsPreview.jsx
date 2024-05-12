import { useState, useEffect } from "react";

import { Tabs } from "barrel";

import styles from "./TabsPreview.module.scss";

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
		setMedia([]);
		files.forEach((file, index) => {
			if (!acceptedTypes.includes(file.file.type)) return;
			const blob = file.file;
			const url = URL.createObjectURL(blob);
			const type = file.type;
			const name = file.file.name;
			const size = file.file.size;
			const key = index;

			const media = { url, type, name, size, key, blob };

			if (file.type === "video") {
				const video = document.createElement("video");
				video.src = url;
				video.addEventListener("loadeddata", () => {
					video.currentTime = 0;
				});
				video.addEventListener("seeked", () => {
					const canvas = document.createElement("canvas");
					canvas.width = video.videoWidth;
					canvas.height = video.videoHeight;
					const context = canvas.getContext("2d");
					context.drawImage(video, 0, 0, canvas.width, canvas.height);
					const thumbnailUrl = canvas.toDataURL();
					media.thumbnailUrl = thumbnailUrl;
					setMedia((prevMedia) => [...prevMedia, media]);
				});
			} else {
				setMedia((prevMedia) => [...prevMedia, media]);
			}
		});
	}, [files]);

	useEffect(() => {
		const tabs = media.map((file) => {
			return {
				tab: <img src={file.thumbnailUrl || file.url} alt={file.name} height={30} width={30} />,
				panel: <img src={file.thumbnailUrl || file.url} alt={file.name} className={styles.panelImage} />,
			};
		});
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
