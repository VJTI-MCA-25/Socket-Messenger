import { useContext, useEffect } from "react";
import { Outlet, useLoaderData, useNavigate } from "react-router-dom";

import { Sidenav } from "../Components";

import { UserContext } from "../../contexts/UserContext";

const Home = () => {
	const user = useContext(UserContext);
	const navigate = useNavigate();
	const report = useLoaderData();

	useEffect(() => {
		if (!user) navigate("/auth/login");
		if (report.isDisplayNameSet) navigate("/display-name", { state: { redirect: true } });
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
