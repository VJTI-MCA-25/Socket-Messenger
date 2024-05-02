import { useState } from "react";
import { BrowseFilesView, UrlView, WebcamView } from "./viewsBarrel";

import styles from "./ImagesModal.module.scss";

function ImagesModal() {
	const [view, setView] = useState("browseFiles");
	return (
		<div className={styles.container}>
			<div className={styles.sidenav}>
				<ul className={styles.list}>
					<li
						onClick={() => setView("browseFiles")}
						className={`${view == "browseFiles" ? "active" : ""} ${styles.item} waves-effect waves-light`}>
						Browse Files
					</li>
					<li
						onClick={() => setView("webcam")}
						className={`${view == "webcam" ? "active" : ""} ${styles.item} waves-effect waves-light`}>
						Webcam
					</li>
					<li
						onClick={() => setView("url")}
						className={`${view == "url" ? "active" : ""} ${styles.item} waves-effect waves-light`}>
						URL
					</li>
				</ul>
			</div>
			<div className={styles.view}>
				<WindowView view={view} />
			</div>
		</div>
	);
}

function WindowView({ view }) {
	switch (view) {
		case "browseFiles":
			return <BrowseFilesView />;
		case "webcam":
			return <WebcamView />;
		case "url":
			return <UrlView />;
		default:
			return null;
	}
}

export { ImagesModal };
