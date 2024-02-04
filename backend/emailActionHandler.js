import { createTransport } from "nodemailer";
import { auth } from "./initialize.js";

async function sendVerificationEmail(email, continueUrl) {
	let actionCodeSettings = {
		url: continueUrl,
		handleCodeInApp: false,
	};

	try {
		let link = await auth.generateEmailVerificationLink(email, actionCodeSettings);
		let emailOptions = {
			from: "Discord Clone Team",
			to: email,
			subject: "Email Verification",
			html: `
			<h2>Thank you for registering!</h2>
			<a href=${link}>Click Here</a>
			`,
		};

		let info = sendMail(emailOptions);
		return info;
	} catch (error) {
		throw error;
	}
}

function sendMail(emailOptions) {
	const Transport = createTransport({
		service: "Gmail",
		auth: {
			user: process.env.EMAIL,
			pass: process.env.PASSWORD,
		},
	});

	return Transport.sendMail(emailOptions, (error, info) => {
		if (error) {
			throw error;
		} else {
			console.log(info);
			return info;
		}
	});
}

export { sendVerificationEmail };
