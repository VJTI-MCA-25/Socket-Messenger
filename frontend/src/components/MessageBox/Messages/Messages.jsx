import React, { useMemo } from "react";
import styles from "./Messages.module.scss";
import GroupedMessages from "../GroupedMessages/GroupedMessages";

const Messages = React.memo(({ group }) => {
	const messagesElements = useMemo(() => {
		return Object.entries(group.messages)
			.sort()
			.map(([date, messages]) => {
				const groupedMessages = messages.reduce((acc, message) => {
					if (acc.length === 0) {
						acc.push([message]);
					} else {
						const lastGroup = acc[acc.length - 1];
						const lastMessage = lastGroup[lastGroup.length - 1];
						if (lastMessage.sentBy === message.sentBy) {
							lastGroup.push(message);
						} else {
							acc.push([message]);
						}
					}
					return acc;
				}, []);
				return (
					<div key={date}>
						<div className={styles.separator}>{date}</div>
						{groupedMessages.map((messages, index) => (
							<GroupedMessages key={index} messages={messages} group={group} />
						))}
					</div>
				);
			});
	}, [group.messages]);

	return (
		<div className={styles.container}>
			<div className={styles.messages}>{messagesElements}</div>
		</div>
	);
});

export { Messages };
