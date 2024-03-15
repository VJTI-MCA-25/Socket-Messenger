import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMessage, faEllipsisVertical, faEnvelope } from "@fortawesome/free-solid-svg-icons";

const SearchItem = ({ friend, handleInvite, styles }) => {
	return (
		<li className={styles.item}>
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
		</li>
	);
};

export { SearchItem };
