import { useContext, useEffect } from "react";
import { Outlet, useLoaderData, useNavigate } from "react-router-dom";

import { Sidenav } from "../Components";

import { UserContext } from "../../contexts/UserContext";

const Home = () => {
	const user = useContext(UserContext);
	const navigate = useNavigate();

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
