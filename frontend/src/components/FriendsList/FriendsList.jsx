import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ListUsers } from "barrel";
import { FriendsContext } from "contexts/FriendsContext";
import { createGroup } from "services/userFunctions";

import styles from "./FriendsList.module.scss";

const FriendsList = () => {
	const friends = useContext(FriendsContext);
	const navigate = useNavigate();

	async function handleCreateGroup(friend) {
		let friendUid = friend.uid;
		if (friend?.dm) return navigate(`/channels/${friend.dm}`);
		try {
			const response = await createGroup(friendUid);
			navigate(`/channels/${response.groupId}`);
		} catch (error) {
			console.log("Error creating group", error);
		}
	}

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
							<ListUsers usersList={friends} handleCreateGroup={handleCreateGroup} />
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
