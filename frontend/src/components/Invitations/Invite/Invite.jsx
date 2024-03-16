import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { animated } from "@react-spring/web";

import styles from "./Invite.module.scss";

function Invite({ invite, handleResponse, anim }) {
	function actionHandler(e) {
		const action = e.target.dataset.action;
		return ["accepted", "declined", "canceled"].includes(action) ? handleResponse(invite.id, action) : null;
	}

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
			<div className={styles.inviteActions} onClick={actionHandler}>
				{!invite.sentByCurrentUser ? (
					<>
						<button data-action="accepted" className="waves-effect waves-light">
							Yes
						</button>
						<button data-action="declined" data-id={invite.id} className="waves-effect waves-light red">
							{/* Decline */}
							<FontAwesomeIcon icon={faTimes} />
						</button>
						{/* <FontAwesomeIcon icon={faTimes} data-id={invite.id} data-action="declined" /> */}
					</>
				) : (
					<button data-action="canceled" data-id={invite.id} className="waves-effect waves-light red">
						<FontAwesomeIcon icon={faTimes} />
					</button>
				)}
			</div>
		</animated.div>
	);
}

export { Invite };
