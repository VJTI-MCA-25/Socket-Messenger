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

async function uploadMedia(media, groupId, onUploadProgress) {
	const formData = new FormData();
	formData.append("media", media);
	formData.append("groupId", groupId);

	try {
		const response = await instance.post("/messages/upload-media", formData, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
			onUploadProgress,
		});

		return response.data;
	} catch (error) {
		throw error;
	}
}

async function getMedia(url) {
	try {
		const response = await instance.get("/messages/get-media", {
			params: { url },
		});
		return response.data;
	} catch (error) {
		throw { ...error.response.data };
	}
}

export { getMessages, getLinkPreview, uploadMedia, getMedia };
