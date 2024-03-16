import { useContext, useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { InvitesContextProvider } from "contexts/InvitesContext";

import { Sidenav } from "barrel";

import { UserContext } from "contexts/UserContext";

const Home = () => {
	const user = useContext(UserContext);
	const navigate = useNavigate();

	const [isNavOpen, setIsNavOpen] = useState(true);

	useEffect(() => {
		if (!user) {
			navigate("/auth/login");
		}
	}, [user]);

	if (user !== null) {
		return (
			<InvitesContextProvider>
				<Sidenav isNavOpen={isNavOpen} setIsNavOpen={setIsNavOpen} />
				{/* Might change user to be passed in outlet context */}
				<main className={isNavOpen ? "shift" : ""}>
					<Outlet />
				</main>
			</InvitesContextProvider>
		);
	}
};

export { Home };
