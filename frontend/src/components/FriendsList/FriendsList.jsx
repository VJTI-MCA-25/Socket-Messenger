import { useContext, useEffect, useState } from "react";
import { ListUsers } from "barrel";
import { FriendsContext } from "contexts/FriendsContext";

import styles from "./FriendsList.module.scss";

const FriendsList = () => {
	const friends = useContext(FriendsContext);

	return (
		<div className="row">
			<div className="col s12">
				<div className="row">
					<div className="col s12">
						<div className={styles.header} role="heading" aria-level="2">
							Friends
						</div>
					</div>
				</div>
				<div className="row">
					<div className="col s12">
						{friends.length > 0 ? (
							<ListUsers usersList={friends} />
						) : (
							<div className={styles.emptyListTitle} role="alert" aria-live="polite">
								Looks like you haven't invited anyone yet.
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export { FriendsList };
