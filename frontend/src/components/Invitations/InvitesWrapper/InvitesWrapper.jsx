import { Invite } from "../Invite/Invite";
import { useTransition, animated, useChain, useSpringRef } from "@react-spring/web";

import styles from "./InvitesWrapper.module.scss";

function InvitesWrapper({ invites, heading, handleResponse }) {
	const inviteContainerAnimRef = useSpringRef();
	const inviteAnimRef = useSpringRef();

	const inviteContainerAnim = useTransition(invites.length > 0, {
		from: { x: 100, opacity: 0 },
		enter: { x: 0, opacity: 1 },
		leave: { x: 100, opacity: 0 },
		ref: inviteContainerAnimRef,
		trail: 100,
		config: { duration: 150 },
	});

	const inviteAnim = useTransition(invites, {
		from: { y: -50, opacity: 0 },
		enter: { y: 0, opacity: 1 },
		leave: { x: 300, opacity: 0 },
		ref: inviteAnimRef,
		trail: 100,
		config: { duration: 250 },
		keys: (invite) => invite.id,
	});

	useChain([inviteContainerAnimRef, inviteAnimRef], [0, 0.5]);

	return inviteContainerAnim(
		(anim, item) =>
			item && (
				<animated.div style={anim} className="col s12">
					<div className="row">
						<div className="col s12">
							<h6>{heading}</h6>
						</div>
					</div>
					<div className="row">
						<div className="col s12">
							<div className={styles.invitesContainer}>
								{inviteAnim((anim, invite) => (
									<Invite
										key={invite.id}
										invite={invite}
										handleResponse={handleResponse}
										anim={anim}
									/>
								))}
							</div>
						</div>
					</div>
				</animated.div>
			)
	);
}

export { InvitesWrapper };
