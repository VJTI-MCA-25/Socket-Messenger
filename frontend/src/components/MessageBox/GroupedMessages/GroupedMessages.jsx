import { MessageItem } from "../MessageItem/MessageItem";
import styles from "./GroupedMessages.module.scss";

const GroupedMessages = ({ messages, group }) => {
	let sentBy = group.members[messages[0].sentBy];
	let userSent = messages[0].isUserSent;
	return (
		<div className={`${styles.container} ${userSent ? styles.userSent : ""}`}>
			<div className={styles.user}>
				<img
					src={sentBy?.photoURL ? sentBy?.photoURL : "https://via.placeholder.com/150"}
					alt={sentBy?.displayName}
				/>
			</div>
			<div className={styles.groupedMessages}>
				{messages.map((message, index) => {
					return <MessageItem key={index} message={message} isFirst={index === 0} />;
				})}
			</div>
		</div>
	);
};

export default GroupedMessages;
