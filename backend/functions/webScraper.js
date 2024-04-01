import axios from "axios";
import { validateUrl } from "./serverHelperFunctions.js";
import { load } from "cheerio";

/**
 * Fetches a webpage and extracts link preview information.
 * @param {string} url - The URL of the webpage to fetch.
 * @returns {Promise<Object>} - A promise that resolves to an object containing link preview information.
 * @throws {Error} - If the URL is invalid, the content type is invalid, or if there is an error fetching the webpage.
 */
async function createLinkPreview(url) {
	try {
		// Validate the URL
		if (!validateUrl(url)) throw new Error("Invalid URL");

		// Fetch the webpage
		const response = await axios.get(url);
		if (response.status === 200) {
			// Load HTML content into Cheerio
			// ...

			const $ = load(response.data);

			// Check if the content type is HTML
			const contentType = response.headers["content-type"];
			if (!contentType || !contentType.includes("text/html")) {
				throw new Error("Invalid content type");
			}

			const website = $('meta[property="og:site_name"]').attr("content") || null;

			const type = $('meta[property="og:type"]').attr("content") || null;

			// Extract title
			const title = $('meta[property="og:title"]').attr("content") || $("title").text() || "No title found";

			// Extract description (using meta tag)
			let description =
				$('meta[name="og:description"]').attr("content") || $('meta[name="description"]').attr("content");

			if (description) {
				description = description.length > 150 ? description.substring(0, 150) + "..." : description;
			} else {
				description = "No description found";
			}

			// Extract image (using meta tag)
			const imageUrl = $('meta[property="og:image"]').attr("content") || null;

			// Extract video embed URL (using og:video:secure_url or og:video:url)
			let audioUrl = $('meta[property="og:audio"]').attr("content") || null;

			// Extract video embed URL (using og:video:secure_url or og:video:url)
			let videoUrl =
				$('meta[property="og:video:secure_url"]').attr("content") ||
				$('meta[property="og:video:url"]').attr("content") ||
				null;

			let isVideoEmbed = false;
			if (videoUrl) {
				// Check if the URL is an embed URL
				try {
					const response = await axios.head(videoUrl);
					const xFrameOptions = response.headers["x-frame-options"];
					isVideoEmbed = !xFrameOptions || !["SAMEORIGIN", "DENY"].includes(xFrameOptions.toUpperCase());
				} catch (error) {
					console.error(error);
				}
			}

			// Check if the URL is a video (based on og:type)
			const isVideo = $('meta[property="og:type"]').attr("content")?.includes("video") || false;

			// Create the preview object
			const preview = {
				website: website,
				type: type,
				title: title,
				description: description,
				imageUrl: imageUrl,
				audioUrl: audioUrl,
				isVideo: isVideo,
				videoUrl: videoUrl,
				isVideoEmbed: isVideoEmbed,
			};

			return preview;
		} else {
			throw new Error("Failed to fetch the webpage");
		}
	} catch (error) {
		throw error;
	}
}

export { createLinkPreview };
