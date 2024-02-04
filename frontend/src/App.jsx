import { Outlet } from "react-router-dom";

import { UserContextProvider } from "./contexts/UserContext.jsx";

import "materialize-css/dist/css/materialize.min.css";

import "./App.scss";

function App() {
	return (
		<UserContextProvider>
			<main>
				<Outlet />
			</main>
		</UserContextProvider>
	);
}

export default App;
