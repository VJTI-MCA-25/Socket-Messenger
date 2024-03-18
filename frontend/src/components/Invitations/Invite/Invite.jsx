import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { animated } from "@react-spring/web";

import styles from "./Invite.module.scss";

function Invite({ invite, handleResponse, anim }) {
	function getTitle(invite) {
		if (invite.sentByCurrentUser) {
			return (
				<>
					You sent an invite to
					<span className={styles.displayName}> {invite.sentTo.displayName}</span>
				</>
			);
		} else {
			return (
				<>
					An invite from <span className={styles.displayName}>{invite.sentBy.displayName}</span>.
				</>
			);
		}
	}

	return (
		<animated.div style={anim} className={styles.invite}>
			<div>
				<div className={styles.inviteSender}>{getTitle(invite)}</div>
			</div>
			<div className={styles.inviteActions}>
				{!invite.sentByCurrentUser ? (
					<>
						<button
							onClick={() => handleResponse(invite.id, "accepted")}
							className="waves-effect waves-light"
							aria-label="Accept Invitation">
							Yes
						</button>
						<button
							onClick={() => handleResponse(invite.id, "declined")}
							className="waves-effect waves-light red"
							aria-label="Decline Invitation">
							<FontAwesomeIcon icon={faTimes} />
						</button>
					</>
				) : (
					<button
						onClick={() => handleResponse(invite.id, "canceled")}
						className="waves-effect waves-light"
						aria-label="Cancel Invitation">
						<FontAwesomeIcon icon={faTimes} />
					</button>
				)}
			</div>
		</animated.div>
	);
}

export { Invite };
