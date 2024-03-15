import { Outlet } from "react-router-dom";

import { UserContextProvider } from "contexts/UserContext.jsx";
import { UserDataContextProvider } from "contexts/UserDataContext.jsx";
import { InvitesContextProvider } from "contexts/InvitesContext.jsx";

import "./App.scss";

function App() {
	return (
		<UserContextProvider>
			<UserDataContextProvider>
				<InvitesContextProvider>
					<Outlet />
				</InvitesContextProvider>
			</UserDataContextProvider>
		</UserContextProvider>
	);
}

export default App;
