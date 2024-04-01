import { instance } from "projectConfig";

async function getMessages() {
	try {
		const response = await instance.get("/messages/get-messages");
		return response.data;
	} catch (error) {
		throw { ...error.response.data };
	}
}

async function getLinkPreview(url) {
	try {
		const response = await instance.get("/messages/get-link-preview", {
			params: { url: encodeURIComponent(url) },
		});
		return response.data;
	} catch (error) {
		throw { ...error.response.data };
	}
}

export { getMessages, getLinkPreview };
