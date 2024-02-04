/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { Link, useLocation, useNavigate } from "react-router-dom";

import { sendVerificationMail } from "../../../services/authFunctions";
import { useEffect } from "react";

const VerifyEmail = () => {
	const navigate = useNavigate();
	const state = useLocation().state;
	const email = state?.email;
	const uid = state?.uid;

	useEffect(() => {
		if (!email || !uid) navigate("/");
		else {
			let isCookieSet = document.cookie.includes(`verificationExpiry=${uid}`);
			if (isCookieSet) {
				console.log("Verification Link Already Sent");
			} else {
				sendLink();
			}
		}
	});

	async function sendLink() {
		let domain = window.location.origin;
		let continueUrl = domain + "/auth/login";
		try {
			let result = await sendVerificationMail(email, uid, continueUrl);
			console.log(result);

			let expiry = new Date();
			expiry.setMinutes(expiry.getMinutes() + 30);
			expiry = expiry.toUTCString();
			console.log(expiry);

			document.cookie = `verificationExpiry=${uid}; expires=${expiry}; path="/auth/verify`;
		} catch (error) {
			// This might need parsing
			// Will need to set the parser on the error page for every navigation
			navigate("/error", { state: { error } });
		}
	}

	return (
		<div className="container">
			<div className="row">
				<div className="col s12 center">
					<h5>Verfication Link Sent to your Registered Email Address</h5>
				</div>
				<div className="row">
					<div className="col s6 center">
						<Link to="../login">Go to Login</Link>
					</div>
					<div className="col s6 center">Resend</div>
				</div>
			</div>
		</div>
	);
};

export { VerifyEmail };
