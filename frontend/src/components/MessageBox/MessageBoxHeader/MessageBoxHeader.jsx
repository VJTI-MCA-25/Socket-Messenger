import styles from "./MessageBoxHeader.module.scss";

const MessageBoxHeader = ({ group, scrollAtTop }) => {
	return (
		<div className={`${styles.container} ${scrollAtTop ? styles.scrollAtTop : ""}`}>
			<div className={styles.pic}>
				<img src={group.photoURL ? group.photoURL : "https://via.placeholder.com/150"} alt="Group" />
			</div>
			<div className={styles.title}>{group.displayName}</div>
		</div>
	);
};

export { MessageBoxHeader };
