function parseError(error) {
	if (error?.code === "ERR_NETWORK") {
		// Network error (server down, no internet, etc.)
		return { message: "Network error", code: 500 };
	} else if (error?.name === "FirebaseError") {
		// Firebase error
		return { message: error.message, statusText: error.code, code: error.code };
	} else if (error?.response?.data) {
		// Axios error, return the error object from the server
		return { ...error.response.data };
	} else {
		// Other errors, return the error object
		return { message: error.message, code: error.code };
	}
}

export { parseError };
