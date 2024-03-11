import { useState, useContext, useEffect } from "react";

import { UserContext } from "contexts/UserContext";
import { sockets } from "services/config";
import { respondInvite } from "services/userFunctions";

import styles from "./Invitations.module.scss";

const Invitations = () => {
	const user = useContext(UserContext);

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
			console.log(res);
		} catch (error) {
			console.error(error);
		}
	}

	if (receivedInvites.length === 0) return null;

	return (
		<div className="row">
			<div className="row">
				<div className="col s12 invites-header center-align">You have Invites</div>
			</div>
			<div className="row">
				<div className="col s12">
					<div className={styles.invitesContainer}>
						{receivedInvites.map((invite, index) => {
							return (
								<div key={index} className={styles.invite}>
									<div className={styles.inviteContent}>
										<div className={styles.inviteSender}>
											Do you want to accept an invite from{" "}
											<span>{invite.sentBy.displayName}</span> ?
										</div>
									</div>
									<div className={styles.inviteActions}>
										<button
											onClick={() => handleResponse(invite.id, "accepted")}
											className={styles.acceptBtn + " waves-effect waves-light"}>
											Yes
										</button>
										<button
											onClick={() => handleResponse(invite.id, "declined")}
											className={styles.declineBtn + " waves-effect waves-light red"}>
											Decline
										</button>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			</div>
		</div>
	);
};

export { Invitations };
