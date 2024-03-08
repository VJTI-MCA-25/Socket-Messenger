import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMessage, faEllipsisVertical, faEnvelope } from "@fortawesome/free-solid-svg-icons";

const FriendsListItem = ({ friend, handleInvite }) => {
	return (
		<li className="item">
			<img src="https://via.placeholder.com/150" alt="" className="profile-pic" />
			<div className="display-name">{friend.displayName}</div>
			<div className="actions">
				{friend.isFriend ? (
					<>
						<FontAwesomeIcon icon={faMessage} className="message-icon" />
						<FontAwesomeIcon icon={faEllipsisVertical} className="more-icon" />
					</>
				) : (
					<FontAwesomeIcon icon={faEnvelope} onClick={() => handleInvite(friend)} />
				)}
			</div>
		</li>
	);
};

export { FriendsListItem };
