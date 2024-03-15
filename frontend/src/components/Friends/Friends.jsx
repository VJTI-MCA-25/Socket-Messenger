import { SearchFriend, Invitations } from "barrel";

import styles from "./Friends.module.scss";

const Friends = () => {
	return (
		<div className={styles.container + " container"}>
			<div className="row">
				<div className="col s12">
					<SearchFriend />
				</div>
			</div>
			<div className="row">
				<div className="col s12">
					<Invitations />
				</div>
			</div>
		</div>
	);
};

export { Friends };
