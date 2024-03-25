import styles from "./MessageItem.module.scss";

const MessageItem = ({ message }) => {
	return (
		<div className={styles.messageItem}>
			<div className={styles.message}>
				<span>{message.content}</span>
			</div>
		</div>
	);
};

export { MessageItem };
