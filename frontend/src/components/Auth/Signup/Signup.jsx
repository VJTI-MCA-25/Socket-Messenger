// Imports
import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

import { animated, useSpring, useTrail } from "@react-spring/web";

// Font Awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";

// Services
import { createUser } from "../../../services/authFunctions";

// CSS
import "./Signup.scss";
import M from "materialize-css";

function Signup() {
	const [errorLine, setErrorLine] = useState("");

	const { state } = useLocation();

	const [email, setEmail] = useState(state ? state.email : "");
	const [password, setPassword] = useState(state ? state.password : "");

	const [passwordVisibility, setPasswordVisibility] = useState(false);
	const [showScreen, setShowScreen] = useState(false);

	const navigate = useNavigate();

	useEffect(() => {
		// Materialize Init
		M.updateTextFields();
	}, []);

	// React Spring, delayed animation for the inputs
	// useTrail Hook returns an array of springs (animated values)
	const fadeInRise = useTrail(3, {
		from: { opacity: 0, y: 20 },
		to: { opacity: 1, y: 0 },
		delay: 200,
	});

	const appearRight = useSpring({
		from: { x: 100 },
		to: { x: 0 },
	});

	async function handleSubmit(e) {
		e.preventDefault();
		setErrorLine("");

		// Check if email and password are provided
		if (!email || !password) {
			return setErrorLine("Please fill in all the fields");
		}

		try {
			// Attempt to create a new user
			const res = await createUser(email, password);

			// If user creation is successful, navigate to the home page
			if (res.status === 201) {
				navigate("/auth/verify", { state: { email, uid: res.data.uid } });
			}
		} catch (error) {
			console.error(error);

			// Set error text line for specific errors
			switch (error.statusText) {
				case "auth/email-already-exists":
					setErrorLine("Email already in use");
					break;
				case "auth/invalid-email":
					setErrorLine("Invalid email");
					break;
				case "auth/invalid-password":
					setErrorLine("Weak password");
					break;
				default:
					navigate("/error", { state: { error: { code: error.code, message: error.message } } });
					break;
			}
		}
	}

	return (
		<animated.div style={appearRight}>
			<div className="row signup-container">
				<div className="col s6 inputs">
					<form onSubmit={handleSubmit}>
						<div className="row">
							<h3>Sign Up</h3>
							<span className="error-line center">{errorLine}</span>
							<animated.div style={fadeInRise[0]}>
								<div className="input-field">
									<input
										id="email"
										type="email"
										className="validate"
										value={email}
										autoComplete="email"
										onChange={(e) => setEmail(e.target.value)}
									/>
									<label htmlFor="email">Email</label>
								</div>
							</animated.div>
							<animated.div style={fadeInRise[1]}>
								<div className="input-field">
									<FontAwesomeIcon
										icon={faEye}
										className="eye"
										// onClick={() => setPasswordVisibility((prev) => !prev)}
										onMouseDown={() => setPasswordVisibility(true)}
										onMouseUp={() => setPasswordVisibility(false)}
										onMouseLeave={() => setPasswordVisibility(false)}
									/>
									<input
										id="password"
										autoComplete="new-password"
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										type={passwordVisibility ? "text" : "password"}
										className="validate"
									/>
									<label htmlFor="password">Password</label>
								</div>
							</animated.div>
						</div>
						<div className="row">
							<animated.div style={fadeInRise[2]}>
								<div className="col submit-button s12">
									<button type="submit" className="right waves-effect waves-light btn">
										Sign Up
									</button>
								</div>
							</animated.div>
						</div>
						<div className="row">
							<Link className="left" to="/auth/login" state={{ email, password }}>
								Already a member?
							</Link>
						</div>
					</form>
				</div>
			</div>
		</animated.div>
	);
}

export { Signup };
