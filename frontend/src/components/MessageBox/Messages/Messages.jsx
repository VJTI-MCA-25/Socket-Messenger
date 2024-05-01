import React, { useMemo } from "react";

import GroupedMessages from "../GroupedMessages/GroupedMessages";

import { formatToJSDate, dateStringFromDate } from "helperFunctions";

import styles from "./Messages.module.scss";

const Messages = React.memo(({ group }) => {
	const messagesElements = useMemo(() => {
		return Object.entries(group.messages)
			.sort(([dateA], [dateB]) => {
				let timeA = formatToJSDate(dateA);
				let timeB = formatToJSDate(dateB);

				return timeA - timeB;
			})
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
						<div className={styles.separator}>{dateStringFromDate(date)}</div>
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
