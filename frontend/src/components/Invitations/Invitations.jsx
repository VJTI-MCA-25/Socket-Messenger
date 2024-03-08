import { useContext } from "react";

import { UserContext } from "contexts/UserContext";

import { respondInvite } from "services/userFunctions";

import styles from "./Invitations.module.scss";

const Invitations = ({ invites, setInvites }) => {
	const user = useContext(UserContext);

	async function handleResponse(invite, response) {
		setInvites(invites.filter((inv) => inv.id !== invite.id));
		try {
			const res = await respondInvite(user, invite, response);
			console.log(res);
		} catch (error) {
			console.error(error);
		}
	}

	return (
		<div className={styles.invitesContainer}>
			{invites.map((invite, index) => {
				return (
					<div key={index} className={styles.invite}>
						<div className={styles.inviteContent}>
							<div className={styles.inviteSender}>
								Do you want to accept an invite from <span>{invite.sentBy.displayName}</span> ?
							</div>
						</div>
						<div className={styles.inviteActions}>
							<button
								onClick={() => handleResponse(invite, "accepted")}
								className={styles.acceptBtn + " waves-effect waves-light"}>
								Yes
							</button>
							<button
								onClick={() => handleResponse(invite, "declined")}
								className={styles.declineBtn + " waves-effect waves-light red"}>
								Decline
							</button>
						</div>
					</div>
				);
			})}
		</div>
	);
};

export { Invitations };
