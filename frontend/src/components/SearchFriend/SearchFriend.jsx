import { useEffect, useState } from "react";
import { getUsersList } from "services/userFunctions";
import { ListUsers } from "barrel";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import styles from "./SearchFriend.module.scss";

const SearchFriend = () => {
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
		<div className={styles.container}>
			<div className="row">
				<div className={styles.searchField + " input-field col s12"}>
					<input
						id="search-input"
						name="search-input"
						placeholder="Search for a Friend"
						type="text"
						className={styles.searchInput}
						value={searchInput}
						onChange={(e) => setSearchInput(e.target.value)}
					/>
					<FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
				</div>
			</div>
			<div className="row">
				<div className="col s12">
					<ListUsers usersList={usersList} />
				</div>
			</div>
		</div>
	);
};

export { SearchFriend };
