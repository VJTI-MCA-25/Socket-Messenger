import { SearchFriend, Invitations } from "barrel";

const Friends = () => {
	return (
		<div className="container">
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
