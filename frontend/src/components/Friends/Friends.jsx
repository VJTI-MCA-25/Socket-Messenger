import { SearchFriend, Invitations, FriendsList } from "barrel";

import styles from "./Friends.module.scss";

const Friends = () => {
	return (
		<div className={styles.container}>
			<div className={styles.friendsCol}>
				<div className="row">
					<SearchFriend />
				</div>
				<div className="row">
					<FriendsList />
				</div>
			</div>
			<div className={styles.invitesCol}>
				<Invitations />
			</div>
		</div>
	);
};

export { Friends };
