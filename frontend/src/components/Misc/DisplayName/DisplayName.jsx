import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Preloader } from "barrel";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";

import { checkDisplayName, setData } from "services/userFunctions";

import styles from "./DisplayName.module.scss";

const DisplayName = () => {
	const navigate = useNavigate();

	const [input, setInput] = useState("");
	const [loading, setLoading] = useState(false);
	const [status, setStatus] = useState(null);

	useEffect(() => {
		const timer = setTimeout(async () => {
			if (!input) return setLoading(false);
			try {
				let response = await checkDisplayName(input);
				console.log(response);
				if (response == "user/display-name-available") setStatus("available");
				else setStatus("taken");
			} catch (error) {
				if (error.statusText === "user/invalid-display-name") setStatus("invalid");
				else setStatus("error");
			}
			setLoading(false);
		}, 500);

		return () => clearTimeout(timer);
	}, [input]);

	function handleInput(e) {
		setLoading(true);
		setStatus(null);
		if (e.target.value.length > 20) return;
		if (e.target.value.match(/[^a-zA-Z0-9_]|_{2,}/g)) return;
		setInput(e.target.value);
	}

	function updateStatus(status) {
		let icon = null;
		let text = "";
		switch (status) {
			case "available":
				icon = faCheck;
				text = "Looks good!";
				break;
			case "taken":
				icon = faXmark;
				text = "Sorry, this display name is taken.";
				break;
			case "invalid":
				icon = faXmark;
				text = "Oops Invalid Display Name!";
				break;
			case "error":
				icon = faXmark;
				text = "Something went wrong. Please try again.";
				break;
		}
		return (
			<div className={styles.status}>
				{icon && (
					<FontAwesomeIcon className={icon == faCheck ? styles.checkIcon : styles.errorIcon} icon={icon} />
				)}
				<span>{text}</span>
			</div>
		);
	}

	async function handleSubmit(e) {
		e.preventDefault();

		if (status === "available") {
			setLoading(true);

			try {
				const res = await setData({ displayName: input });
				if (res == "user/data-updated") {
					navigate("/channels", { replace: true });
				}
			} catch (error) {
				//TODO Handle Different Errors for Failed Display Name Update
				setStatus("error");
			}
		}
	}

	return (
		<div className={styles.container}>
			<div className="container">
				<form onSubmit={handleSubmit}>
					<div className="row">
						<div className="col s12">
							Before you get started, set a display name, so your friends can find you.
						</div>
					</div>
					<div className="row">
						<div className="col s10">
							<div className="input-field">
								<input id="display-name" type="text" value={input} onChange={handleInput} />
								<label htmlFor="display-name">Display Name</label>
							</div>
						</div>
					</div>
					<div className="row">
						<div className="col s8">{loading ? <Preloader /> : updateStatus(status)}</div>
						<div className="col s4">
							<button
								className="waves-effect waves-light btn"
								type="submit"
								disabled={loading || status !== "available"}>
								Set Display Name
							</button>
						</div>
					</div>
				</form>
			</div>
		</div>
	);
};

export { DisplayName };
