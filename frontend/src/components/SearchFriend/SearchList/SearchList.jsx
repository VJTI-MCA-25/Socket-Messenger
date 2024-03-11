import { SearchItem } from "./SearchItem/SearchItem";

import { sendInvite } from "services/userFunctions";

import { toast } from "materialize-css";
import "./SearchList.scss";

const SearchList = ({ usersList }) => {
	async function handleInvite(sendTo) {
		try {
			let response = await sendInvite(sendTo);
			if (response === "invite/sent") {
				toast({ html: "Invite sent!" });
			}
		} catch (error) {
			if (error.statusText === "invite/already-sent") toast({ html: "Invite already sent!" });
			if (error.statusText === "invite/already-received") toast({ html: "Invite already received!" });
			else console.error(error);
		}
	}

	function populateList() {
		return usersList.map((user, index) => <SearchItem key={index} friend={user} handleInvite={handleInvite} />);
	}

	return <ul className="friends-list">{populateList()}</ul>;
};

export { SearchList };
