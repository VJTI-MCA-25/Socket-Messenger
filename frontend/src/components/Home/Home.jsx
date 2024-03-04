import { useContext } from "react";
import { Outlet } from "react-router-dom";

import { Sidenav } from "../Components";

import { UserContext } from "../../contexts/UserContext";

const Home = () => {
	const user = useContext(UserContext);

	if (user !== null) {
		return (
			<>
				<Sidenav />
				<Outlet />
			</>
		);
	}
};

export { Home };
