import { useContext, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";

import { Sidenav } from "components/Components";

import { UserContext } from "contexts/UserContext";

const Home = () => {
	const user = useContext(UserContext);
	const navigate = useNavigate();

	useEffect(() => {
		if (!user) {
			navigate("/auth/login");
		}
	}, [user]);

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
