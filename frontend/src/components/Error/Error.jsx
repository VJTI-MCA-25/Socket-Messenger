import { useLocation, useRouteError, useNavigate } from "react-router-dom";

import "./Error.scss";
import { useEffect } from "react";

const Error = () => {
	// eslint-disable-next-line react-hooks/rules-of-hooks
	const error = useLocation().state?.error || useRouteError();
	const navigate = useNavigate();

	useEffect(() => {
		if (!error) navigate("/");
	}, [error, navigate]);

	let code = error?.code || error?.status;
	let message = error?.message || error?.statusText;

	if (error) {
		return (
			<div className="container error-page">
				<div className="error-code" style={{ fontSize: typeof code === "number" ? "10rem" : "2rem" }}>
					{code}
				</div>
				<div className="error-content">
					<h3>Something went wrong</h3>
					<h5>{message}</h5>
				</div>
			</div>
		);
	}
};

export default Error;
