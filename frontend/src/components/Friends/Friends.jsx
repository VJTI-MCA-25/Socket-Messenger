import { useContext, useEffect, useState } from "react";

import { UserContext } from "contexts/UserContext";

import { getUsersList } from "services/userFunctions";
import { manager } from "services/firebase-config";

import { Invitations } from "components/Invitations/Invitations";
import { FriendsList } from "./FriendsList/FriendsList";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

import "./Friends.scss";

const Friends = () => {
	const [searchInput, setSearchInput] = useState("");
	const [usersList, setUsersList] = useState([]);
	const [invites, setInvites] = useState([]);

	const [sentInvites, setSentInvites] = useState([]);
	const [receivedInvites, setReceivedInvites] = useState([]);

	const user = useContext(UserContext);

	useEffect(() => {
		setSentInvites(invites.filter((invite) => invite.sentByCurrentUser));
		setReceivedInvites(invites.filter((invite) => !invite.sentByCurrentUser));
	}, [invites]);

	useEffect(() => {
		const invites = manager.socket("/invites", { auth: { token: user.accessToken } });
		invites.on("invites", (data) => {
			setInvites(data);
		});
		return () => {
			invites.disconnect();
		};
	}, []);

	useEffect(() => {
		if (searchInput.length === 0) {
			setUsersList([]);
		}
		const timer = setTimeout(async () => {
			if (searchInput.length > 3) {
				try {
					const response = await getUsersList(user, searchInput);
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
			{receivedInvites.length > 0 && (
				<Invites receivedInvites={receivedInvites} setReceivedInvites={setReceivedInvites} />
			)}
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
					<FriendsList usersList={usersList} user={user} />
				</div>
			</div>
		</div>
	);
};

function Invites({ receivedInvites, setReceivedInvites }) {
	return (
		<div className="row">
			<div className="row">
				<div className="col s12 invites-header center-align">You have Invites</div>
			</div>
			<div className="row">
				<div className="col s12">
					<Invitations invites={receivedInvites} setInvites={setReceivedInvites} />
				</div>
			</div>
		</div>
	);
}

export { Friends };
