import { Outlet } from "react-router-dom";

import { UserContextProvider } from "contexts/UserContext.jsx";
import { UserDataContextProvider } from "contexts/UserDataContext.jsx";

import "./App.scss";

function App() {
	return (
		<UserContextProvider>
			<UserDataContextProvider>
				<Outlet />
			</UserDataContextProvider>
		</UserContextProvider>
	);
}

export default App;
