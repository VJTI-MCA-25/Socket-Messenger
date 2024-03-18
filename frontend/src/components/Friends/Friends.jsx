import { useReducer } from "react";
import { SearchFriend, Invitations, FriendsList } from "barrel";

import styles from "./Friends.module.scss";

const Friends = () => {
	const [updateDep, forceUpdate] = useReducer((prev) => prev + 1, 0);

	return (
		<div className={styles.container}>
			<div className={styles.friendsCol}>
				<div className="container">
					<div className="row">
						<SearchFriend />
					</div>
					<div className="row">
						<FriendsList updateDep={updateDep} />
					</div>
				</div>
			</div>
			<div className={styles.invitesCol}>
				<Invitations forceUpdate={forceUpdate} />
			</div>
		</div>
	);
};

export { Friends };
