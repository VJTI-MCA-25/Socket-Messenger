import { useState, useEffect } from "react";

import { sockets } from "services/config";
import { respondInvite } from "services/userFunctions";

import styles from "./Invitations.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

const Invitations = () => {
	const [invites, setInvites] = useState([]);

	const [sentInvites, setSentInvites] = useState([]);
	const [receivedInvites, setReceivedInvites] = useState([]);

	useEffect(() => {
		setSentInvites(invites.filter((invite) => invite.sentByCurrentUser));
		setReceivedInvites(invites.filter((invite) => !invite.sentByCurrentUser));
	}, [invites]);

	useEffect(() => {
		sockets.invitations.connect();
		sockets.invitations.on("invites", (data) => {
			setInvites(data);
		});
		return () => {
			sockets.invitations.disconnect();
		};
	}, []);

	async function handleResponse(inviteId, status) {
		setInvites(invites.filter((inv) => inv.id !== inviteId));
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
				<div className="col s12 invites-header">You have Invites</div>
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
					<span className="display-name"> {invite.sentTo.displayName}</span>
				</>
			);
		} else {
			return (
				<>
					<span className="display-name">{invite.sentBy.displayName}</span> sent you an invite
				</>
			);
		}
	}

	return (
		<div className={styles.invite}>
			<div className={styles.inviteContent}>
				<div className={styles.inviteSender}>{getTitle(invite)}</div>
			</div>
			<div className={styles.inviteActions} onClick={actionHandler}>
				{!invite.sentByCurrentUser ? (
					<>
						<button data-action="accepted" className={styles.acceptBtn + " waves-effect waves-light"}>
							Yes
						</button>
						<button
							data-action="declined"
							data-id={invite.id}
							className={styles.declineBtn + " waves-effect waves-light red"}>
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
				<div className="col s12">{heading}</div>
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
