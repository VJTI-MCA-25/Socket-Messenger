import styles from "./Preloader.module.scss";

function Preloader() {
	return (
		<div className={`${styles.preloaderWrapper} preloader-wrapper small active`} role="status" aria-live="polite">
			<div className="spinner-layer spinner-green-only">
				<div className="circle-clipper left">
					<div className="circle"></div>
				</div>
				<div className="gap-patch">
					<div className="circle"></div>
				</div>
				<div className="circle-clipper right">
					<div className="circle"></div>
				</div>
			</div>
		</div>
	);
}

export { Preloader };
