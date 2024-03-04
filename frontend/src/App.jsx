import { Outlet } from "react-router-dom";

import { UserContextProvider } from "./contexts/UserContext.jsx";

import "materialize-css/dist/css/materialize.min.css";

import "./App.scss";
import { UserDataContextProvider, UserDataContext } from "./contexts/UserDataContext.jsx";

function App() {
	return (
		<UserContextProvider>
			<UserDataContextProvider>
				<div className="mainContainer">
					<Outlet />
				</div>
			</UserDataContextProvider>
		</UserContextProvider>
	);
}

export default App;
