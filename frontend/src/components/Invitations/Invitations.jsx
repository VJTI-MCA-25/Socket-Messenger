import { useEffect, useState, useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

import { respondInvite } from "services/userFunctions";
import { InvitesContext } from "contexts/InvitesContext";

import styles from "./Invitations.module.scss";

const Invitations = () => {
	const invites = useContext(InvitesContext);
	const [sentInvites, setSentInvites] = useState([]);
	const [receivedInvites, setReceivedInvites] = useState([]);

	useEffect(() => {
		setSentInvites(invites.filter((invite) => invite.sentByCurrentUser));
		setReceivedInvites(invites.filter((invite) => !invite.sentByCurrentUser));
	}, [invites]);

	async function handleResponse(inviteId, status) {
		try {
			const res = await respondInvite(inviteId, status);
		} catch (error) {
			console.error(error);
		}
	}

	if (invites.length === 0) return null;

	return (
		<div className="row">
			<div className="row">
				<div className={styles.invitesContainerHeader + " col s12"}>You have Invites</div>
			</div>
			<div className="row">
				<div className="col s12">
					<div className="row">
						<InvitesWrapper
							invites={receivedInvites}
							heading="Received Invites"
							handleResponse={handleResponse}
						/>
					</div>
					<div className="row">
						<InvitesWrapper
							invites={sentInvites}
							heading="Your Sent Invites"
							handleResponse={handleResponse}
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

function Invite({ invite, handleResponse }) {
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
					<span className={styles.displayName}>{invite.sentBy.displayName}</span> sent you an invite
				</>
			);
		}
	}

	return (
		<div className={styles.invite}>
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
							Decline
						</button>
					</>
				) : (
					<FontAwesomeIcon className="cancel-invite-icon" data-action="canceled" icon={faTimes} />
				)}
			</div>
		</div>
	);
}

function InvitesWrapper({ invites, heading, handleResponse }) {
	if (invites.length === 0) return null;
	return (
		<div className="col s12">
			<div className="row">
				<div className="col s12">
					<h6>{heading}</h6>
				</div>
			</div>
			<div className="row">
				<div className="col s12">
					<div className={styles.invitesContainer}>
						{invites.map((invite) => (
							<Invite key={invite.id} invite={invite} handleResponse={handleResponse} />
						))}
					</div>
				</div>
			</div>
		</div>
	);
}

export { Invitations };
