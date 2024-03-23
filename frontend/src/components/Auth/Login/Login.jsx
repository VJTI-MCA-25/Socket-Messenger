// Imports
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { animated, useSpring, useTrail } from "@react-spring/web";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { loginUser } from "services/authFunctions";
import { updateTextFields } from "materialize-css";

// CSS
import styles from "./Login.module.scss";

function Login() {
	const [errorLine, setErrorLine] = useState("");

	const { state } = useLocation();

	const [email, setEmail] = useState(state?.email ? state.email : "thakur.aashay@gmail.com");
	const [password, setPassword] = useState(state?.password ? state.password : "test1234");

	const [passwordVisibility, setPasswordVisibility] = useState(false);
	const [rememberMe, setRememberMe] = useState(false);

	const navigate = useNavigate();

	useEffect(() => {
		// Materialize Init
		updateTextFields();
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

	async function handleLogin(e) {
		e.preventDefault();
		setErrorLine("");

		// Check if email and password are provided
		if (!email || !password) {
			return setErrorLine("Please fill in all the fields");
		}

		try {
			// Attempt to log in the user
			const res = await loginUser(email, password, rememberMe);

			// If login is successful, navigate to the home page
			if (res.status === 200) {
				navigate("/channels");
			}
		} catch (error) {
			// Set error text line for specific errors
			switch (error.statusText) {
				case "auth/invalid-email":
					setErrorLine("Invalid email");
					break;
				case "auth/invalid-credential":
					setErrorLine("Invalid credentials");
					break;
				case "auth/email-not-verified":
					navigate("/channels", { state: { emailVerification: false } });
					break;
				default:
					navigate("/error", { state: { error: { code: error.code, message: error.message } } });
					break;
			}
		}
	}

	return (
		<div className={styles.container}>
			<div className="container">
				<div className="row">
					<animated.div style={appearRight}>
						<div className={styles.form + " col s12 m8 l6"}>
							<form onSubmit={handleLogin} aria-label="Login Form">
								<div className="row">
									<h3>Log In</h3>
									<span className={styles.errorLine + " center"} role="alert" aria-live="assertive">
										{errorLine}
									</span>
									<animated.div style={fadeInRise[0]}>
										<div className="input-field">
											<input
												id="email"
												type="email"
												className="validate"
												value={email}
												autoComplete="email"
												onChange={(e) => setEmail(e.target.value)}
												aria-labelledby="email-label"
												required
											/>
											<label htmlFor="email" id="email-label">
												Email
											</label>
										</div>
									</animated.div>
									<animated.div style={fadeInRise[1]}>
										<div className="input-field">
											<FontAwesomeIcon
												icon={faEye}
												className={styles.eye}
												onMouseDown={() => setPasswordVisibility(true)}
												onMouseUp={() => setPasswordVisibility(false)}
												onMouseLeave={() => setPasswordVisibility(false)}
												aria-label="Toggle Password Visibility"
											/>
											<input
												id="password"
												autoComplete="current-password"
												value={password}
												onChange={(e) => setPassword(e.target.value)}
												type={passwordVisibility ? "text" : "password"}
												className="validate"
												aria-labelledby="password-label"
												required
											/>
											<label htmlFor="password" id="password-label">
												Password
											</label>
										</div>
									</animated.div>
								</div>
								<div className="row">
									<div className="col s6">
										<p>
											<label>
												<input
													type="checkbox"
													checked={rememberMe}
													id="remember-me"
													onChange={(e) => setRememberMe(e.target.checked)}
												/>
												<span>Remember Me</span>
											</label>
										</p>
									</div>
									<animated.div style={fadeInRise[2]}>
										<div className={styles.submitButton + " col s6"}>
											<button type="submit" className="right waves-effect waves-light btn">
												Log In
											</button>
										</div>
									</animated.div>
								</div>
								<div className="row">
									<Link className="left" to="/auth/signup" state={{ email, password }}>
										New Here?
									</Link>
								</div>
							</form>
						</div>
					</animated.div>
				</div>
			</div>
		</div>
	);
}

export { Login };
