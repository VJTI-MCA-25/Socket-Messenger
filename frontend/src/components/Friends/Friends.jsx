import { useContext, useEffect, useState } from "react";

import { getUsersList } from "services/userFunctions";

import { UserContext } from "contexts/UserContext";

import { Invitations } from "components/Invitations/Invitations";
import { FriendsList } from "./FriendsList/FriendsList";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

import "./Friends.scss";

const Friends = () => {
	const user = useContext(UserContext);

	const [searchInput, setSearchInput] = useState("");
	const [usersList, setUsersList] = useState([]);

	useEffect(() => {
		if (searchInput.length === 0) {
			setUsersList([]);
		}
		const timer = setTimeout(async () => {
			if (searchInput.length > 3) {
				try {
					const response = await getUsersList(searchInput);
					setUsersList(response);
				} catch (error) {
					console.error(error);
				}
			}
		}, 500);
		return () => clearTimeout(timer);
	}, [searchInput]);

	return (
		<div className="friendsContainer">
			{user.displayName}
			<Invitations />
			<div className="row">
				<div className="row">
					<div className="input-field col s12 search-field">
						<input
							placeholder="Search for a Friend"
							type="text"
							className="validate search-input"
							value={searchInput}
							onChange={(e) => setSearchInput(e.target.value)}
						/>
						<FontAwesomeIcon icon={faSearch} className="search-icon" />
					</div>
				</div>
			</div>
			<div className="row">
				<div className="col s12">
					<FriendsList usersList={usersList} />
				</div>
			</div>
		</div>
	);
};

export { Friends };
