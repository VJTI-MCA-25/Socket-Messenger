import { useEffect, useState } from "react";
import { ListUsers } from "barrel";
import { getFriends } from "services/authFunctions";

import styles from "./FriendsList.module.scss";

const FriendsList = () => {
	const [friends, setFriends] = useState([]);

	useEffect(() => {
		try {
			(async () => {
				const response = await getFriends();
				setFriends(response.data);
			})();
		} catch (error) {
			console.error(error);
		}
	}, []);

	useEffect(() => {
		console.log(friends);
	}, [friends]);

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
						<ListUsers usersList={friends} />
					</div>
				</div>
			</div>
		</div>
	);
};

export { FriendsList };
