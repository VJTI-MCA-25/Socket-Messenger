import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMessage, faEllipsisVertical, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { animated } from "@react-spring/web";

const UserItem = ({ friend, handleInvite, styles, anim, toggleMenu, children, handleCreateGroup }) => {
	return (
		<animated.li style={anim} className={styles.item} role="listitem">
			<img src="https://via.placeholder.com/150" alt="Profile Picture" className={styles.profilePic} />
			<div className="display-name">{friend.displayName}</div>
			<div className={styles.actions}>
				{friend.isFriend ? (
					<>
						<button
							onClick={() => handleCreateGroup(friend)}
							className={styles.button}
							aria-label="Send Message">
							<FontAwesomeIcon icon={faMessage} className="message-icon" />
						</button>
						<button
							onClick={() => toggleMenu(friend.uid)}
							className={styles.button}
							aria-label="More Options">
							<FontAwesomeIcon icon={faEllipsisVertical} className="more-icon" />
							{children}
						</button>
					</>
				) : (
					<button
						className={styles.button}
						aria-label="Send Invitation"
						onClick={() => handleInvite(friend.uid)}>
						<FontAwesomeIcon icon={faEnvelope} />
					</button>
				)}
			</div>
		</animated.li>
	);
};

export { UserItem };
