import { Outlet } from "react-router-dom";

import { UserContextProvider } from "contexts/UserContext.jsx";
import { UserDataContextProvider } from "contexts/UserDataContext.jsx";

import "materialize-css/dist/css/materialize.min.css";
import "./App.scss";

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
