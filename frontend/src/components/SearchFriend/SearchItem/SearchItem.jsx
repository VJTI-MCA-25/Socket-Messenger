import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMessage, faEllipsisVertical, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { animated } from "@react-spring/web";

const SearchItem = ({ friend, handleInvite, styles, anim }) => {
	return (
		<animated.li style={anim} className={styles.item}>
			<img src="https://via.placeholder.com/150" alt="" className={styles.profilePic} />
			<div className="display-name">{friend.displayName}</div>
			<div className={styles.actions}>
				{friend.isFriend ? (
					<>
						<FontAwesomeIcon icon={faMessage} className="message-icon" />
						<FontAwesomeIcon icon={faEllipsisVertical} className="more-icon" />
					</>
				) : (
					<FontAwesomeIcon icon={faEnvelope} onClick={() => handleInvite(friend.uid)} />
				)}
			</div>
		</animated.li>
	);
};

export { SearchItem };
