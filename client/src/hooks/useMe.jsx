import { useCallback, useState } from "react";
import api, { AUTH_LOGOUT_EVENT } from "../api/api";

export default function useMe() {
	const [user, setUser] = useState(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);

	const parseError = useCallback((err, fallback) => {
		const data = err?.response?.data;
		if (!data) return fallback;

		if (data.errors && typeof data.errors === "object") {
			const messages = Array.isArray(data.errors)
				? data.errors.join(", ")
				: Object.values(data.errors).flat().join(" ");
			if (messages) return messages;
		}

		return data.message || data.error || fallback;
	}, []);

	const getMe = useCallback(async () => {
		setIsLoading(true);
		setError(null);

		try {
			const response = await api.get("/me");
			const nextUser = response?.data ?? null;
			setUser(nextUser);
			return nextUser;
		} catch (err) {
			const message = parseError(err, "Failed to fetch user profile");
			setError(message);
			throw err;
		} finally {
			setIsLoading(false);
		}
	}, [parseError]);

	const updateMe = useCallback(async (data) => {
		setIsLoading(true);
		setError(null);

		try {
			const response = await api.patch("/me", data);
			const nextUser = response?.data ?? null;
			setUser(nextUser);
			return nextUser;
		} catch (err) {
			const message = parseError(err, "Failed to update user profile");
			setError(message);
			throw err;
		} finally {
			setIsLoading(false);
		}
	}, [parseError]);

	const deleteMe = useCallback(async () => {
		setIsLoading(true);
		setError(null);

		try {
			const response = await api.delete("/me");
			setUser(null);
			localStorage.removeItem("token");
			window.dispatchEvent(new Event(AUTH_LOGOUT_EVENT));
			return response?.data ?? null;
		} catch (err) {
			const message = parseError(err, "Failed to delete account");
			setError(message);
			throw err;
		} finally {
			setIsLoading(false);
		}
	}, [parseError]);

	const clearMeState = useCallback(() => {
		setUser(null);
		setError(null);
	}, []);

	return {
		user,
		isLoading,
		error,
		getMe,
		updateMe,
		deleteMe,
		clearMeState,
		setUser,
		setError,
	};
}
