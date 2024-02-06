/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { Link, useLocation, useNavigate } from "react-router-dom";

import { sendVerificationMail } from "../../../services/authFunctions";
import { useState, useEffect } from "react";

import "./VerifyEmail.scss";

const INITITAL_TIMER = 5;

const VerifyEmail = () => {
	const navigate = useNavigate();
	const state = useLocation().state;
	const email = state?.email;
	const uid = state?.uid;

	/**
	 * isLinkSent
	 * 0 - Not Sent
	 * 1 - Already Sent (Cookie Exists)
	 * 2 - Sent
	 */
	const [isLinkSent, setIsLinkSent] = useState(0);
	const [timer, setTimer] = useState(INITITAL_TIMER);
	const [count, setCount] = useState(1); // TODO: Save this in local storage or somewhere else with an expiry, so as to limit the number of resends

	useEffect(() => {
		let interval = setInterval(() => {
			setTimer(timer - 1);
		}, 1000);
		if (timer <= 0) {
			clearInterval(interval);
			console.log(interval);
		}
		return () => clearInterval(interval);
	}, [timer]);

	useEffect(() => {
		if (!email || !uid) navigate("/");
		else {
			if (checkCookie()) {
				setIsLinkSent((prev) => (prev === 0 ? 1 : prev));
			} else {
				sendLink();
				setIsLinkSent(2);
			}
		}
	}, [isLinkSent]);

	function checkCookie() {
		let isCookieSet = document.cookie.includes(`verificationExpiry=${uid}`);
		if (isCookieSet) {
			return true;
		} else {
			return false;
		}
	}

	async function sendLink() {
		let domain = window.location.origin;
		let continueUrl = domain + "/auth/login";
		try {
			await sendVerificationMail(email, uid, continueUrl);

			let expiry = new Date();
			expiry.setMinutes(expiry.getMinutes() + 30);
			expiry = expiry.toUTCString();

			document.cookie = `verificationExpiry=${uid}; expires=${expiry}; path="/auth/verify`;
		} catch (error) {
			// This might need parsing
			//TODO Will need to set the parser on the error page for every navigation
			navigate("/error", { state: { error } });
		}
	}

	function handleResend(e) {
		e.preventDefault();
		setTimer(count * INITITAL_TIMER);
		setCount(count + 1);
		sendLink();
		setIsLinkSent(2);
	}

	return (
		<div className="container">
			<div className="row">
				<div className="col s12 center">
					<h5>Verfication Link Sent to your Registered Email Address</h5>
				</div>
				<div className="row">
					<div className="col s12 center">
						{isLinkSent === 2 && (
							<>Link Sent. Please check your email and click on the link to verify your email address.</>
						)}
						{isLinkSent === 1 && (
							<>
								Link Already Sent. Please check your email and click on the link to verify your email
								address.
							</>
						)}
						<br />
						If you didn't receive the link, please press Resend when the option is available.
					</div>
				</div>
				<div className="row"></div>
				<div className="row">
					<div className="col s6 center">
						<Link to="../login">Go to Login</Link>
					</div>
					<div className="col s6 center">
						{timer <= 0 ? (
							<a className="resend-link" onClick={handleResend}>
								Resend
							</a>
						) : (
							<span className="resend-link unavailable">Resend in {timer} seconds</span>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export { VerifyEmail };
