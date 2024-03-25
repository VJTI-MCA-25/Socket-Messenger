import React, { useMemo } from "react";
import { MessageItem } from "../MessageItem/MessageItem";
import styles from "./Messages.module.scss";

const Messages = React.memo(({ group }) => {
	const messagesElements = useMemo(() => {
		return Object.entries(group.messages)
			.sort()
			.map(([date, messages]) => {
				return (
					<div key={date}>
						<div className={styles.separator}>{date}</div>
						{messages.map((message) => (
							<MessageItem key={message.time} message={message} />
						))}
					</div>
				);
			});
	}, [group.messages]);

	return <div className={styles.messages}>{messagesElements}</div>;
});

export { Messages };
