import { useEffect, useState, useContext } from "react";
import { useTransition, animated } from "@react-spring/web";
import { InvitesWrapper } from "./InvitesWrapper/InvitesWrapper";

import { respondInvite } from "services/userFunctions";
import { InvitesContext } from "contexts/InvitesContext";

import styles from "./Invitations.module.scss";

const Invitations = ({ forceUpdate }) => {
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
			forceUpdate(); // force update FriendsList component
		} catch (error) {
			console.error(error);
		}
	}

	const inviteContainerAnim = useTransition(invites.length > 0, {
		from: { x: 100, opacity: 0 },
		enter: { x: 0, opacity: 1 },
		leave: { x: 100, opacity: 0 },
		config: { duration: 200 },
	});

	return inviteContainerAnim(
		(anims, item) =>
			item && (
				<animated.div style={anims} className={styles.mainContainer + " row"}>
					<div className="row">
						<div className={styles.invitesContainerHeader + " col s12"}>All Invites</div>
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
				</animated.div>
			)
	);
};

export { Invitations };
