import { useEffect, useState } from "react";
import { ListUsers } from "barrel";
import { getFriends } from "services/authFunctions";

import styles from "./FriendsList.module.scss";

const FriendsList = ({ updateDep }) => {
	const [friends, setFriends] = useState([]);

	useEffect(() => {
		console.log("Fetching Data");
		(async () => {
			try {
				const response = await getFriends();
				setFriends(response.data);
			} catch (error) {
				console.error(error);
			}
		})();
	}, [updateDep]);

	return (
		<div className="row">
			<div className="col s12">
				<div className="row">
					<div className="col s12">
						<div className={styles.header}>Friends</div>
					</div>
				</div>
				<div className="row">
					<div className="col s12">
						{friends.length > 0 ? (
							<ListUsers usersList={friends} />
						) : (
							<div className={styles.emptyListTitle}>Looks like you haven't invited anyone yet.</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export { FriendsList };
