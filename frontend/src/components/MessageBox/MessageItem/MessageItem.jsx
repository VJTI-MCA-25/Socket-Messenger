import { Link } from "react-router-dom";
import { convertToFirebaseTimestamp } from "helperFunctions";
import { useSpring, animated } from "@react-spring/web";
import { Media } from "./Media/Media";
import Linkify from "linkify-react";
import styles from "./MessageItem.module.scss";

const MessageItem = ({ message, isFirst }) => {
	let date = message.sentAt ? convertToFirebaseTimestamp(message.sentAt).toDate() : new Date();
	let hour = ("0" + date.getHours()).slice(-2);
	let minute = ("0" + date.getMinutes()).slice(-2);

	const enterMessageAnim = useSpring({
		from: { opacity: 0, x: message.isUserSent ? 100 : -100 },
		to: { opacity: 1, x: 0 },
		config: { duration: 150 },
	});

	const renderLink = ({ attributes, content }) => {
		const { href, ...props } = attributes;
		return (
			<Link to={href} {...props} target="_blank" rel="noopener noreferrer">
				{content}
			</Link>
		);
	};

	return (
		<animated.div
			style={enterMessageAnim}
			className={`${styles.row} ${message.isUserSent ? styles.right : styles.left}`}>
			<div className={`${styles.message} ${isFirst ? styles.isFirst : ""} z-depth-3 `}>
				{message.media && <Media media={message.media} styles={styles} />}
				<div className={styles.content}>
					<Linkify options={{ render: renderLink }}>{message.content}</Linkify>
				</div>
				<div className={styles.time}>
					{hour}:{minute}
				</div>
			</div>
		</animated.div>
	);
};

export { MessageItem };
