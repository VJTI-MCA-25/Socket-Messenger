import React, { useMemo } from "react";
import { MessageItem } from "../MessageItem/MessageItem";
import styles from "./Messages.module.scss";

const Messages = React.memo(({ group }) => {
	console.log(group);
	const messagesElements = useMemo(() => {
		return Object.entries(group.messages)
			.sort()
			.map(([date, messages]) => {
				return (
					<div key={date}>
						<div className={styles.separator}>{date}</div>
						{messages.map((message, index) => {
							return (
								<MessageItem
									key={index}
									message={message}
									isContinuation={index !== 0 ? messages[index - 1].sentBy === message.sentBy : false}
									sender={group.members[message.sentBy]}
								/>
							);
						})}
					</div>
				);
			});
	}, [group.messages]);

	return (
		<div className={styles.container}>
			<div className={styles.header}>
				<div className={styles.title}>Messages</div>
			</div>
			<div className={styles.messages}>{messagesElements}</div>
		</div>
	);
});

export { Messages };
