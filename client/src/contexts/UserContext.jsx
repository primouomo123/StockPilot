import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";

import api, { AUTH_LOGOUT_EVENT } from "../api/api";

const UserContext = createContext(null);

export function UserProvider({ children }) {
	const [currentUser, setCurrentUser] = useState(null);
	const [authIsLoading, setAuthIsLoading] = useState(true);
	const [authIsReady, setAuthIsReady] = useState(false);
	const [authError, setAuthError] = useState(null);

	const parseError = useCallback((err, fallback) => {
		const data = err?.response?.data;
		if (!data) return fallback;

		if (typeof data === "string") {
			return data || fallback;
		}

		if (data.errors && typeof data.errors === "object") {
			const messages = Array.isArray(data.errors)
				? data.errors.join(", ")
				: Object.values(data.errors).flat().join(" ");
			if (messages) return messages;
		}

		return data.message || data.error || data.msg || fallback;
	}, []);

	const clearAuthState = useCallback(() => {
		localStorage.removeItem("token");
		setCurrentUser(null);
		setAuthError(null);
	}, []);

	const loadCurrentUser = useCallback(async () => {
		setAuthIsLoading(true);
		setAuthError(null);

		try {
			const response = await api.get("/me");
			const user = response?.data ?? null;
			setCurrentUser(user);
			return user;
		} catch (err) {
			const message = parseError(err, "Failed to load user");
			setAuthError(message);
			setCurrentUser(null);
			throw err;
		} finally {
			setAuthIsLoading(false);
		}
	}, [parseError]);

	const login = useCallback(async (username, password) => {
		setAuthIsLoading(true);
		setAuthError(null);

		try {
			const response = await api.post("/login", { username, password });
			const token = response?.data?.access_token;
			const user = response?.data?.user ?? null;

			if (!token || !user) {
				throw new Error("Invalid login response payload");
			}

			localStorage.setItem("token", token);

			setCurrentUser(user);
			return user;
		} catch (err) {
			const message = parseError(err, "An error occurred during login.");
			localStorage.removeItem("token");
			setAuthError(message);
			setCurrentUser(null);
			throw err;
		} finally {
			setAuthIsLoading(false);
		}
	}, [parseError]);

	const signUp = useCallback(async (username, email, password) => {
		setAuthIsLoading(true);
		setAuthError(null);

		try {
			const response = await api.post("/signup", {
				username,
				email,
				password,
			});

			const token = response?.data?.access_token;
			const user = response?.data?.user ?? null;

			if (token) {
				localStorage.setItem("token", token);
			}

			setCurrentUser(user);
			return user;
		} catch (err) {
			const message = parseError(err, "An error occurred during sign up.");
			setAuthError(message);
			setCurrentUser(null);
			throw err;
		} finally {
			setAuthIsLoading(false);
		}
	}, [parseError]);

	const updateMe = useCallback(async (data) => {
		setAuthIsLoading(true);
		setAuthError(null);

		try {
			const response = await api.patch("/me", data);
			const user = response?.data ?? null;
			setCurrentUser(user);
			return user;
		} catch (err) {
			const message = parseError(err, "Failed to update profile");
			setAuthError(message);
			throw err;
		} finally {
			setAuthIsLoading(false);
		}
	}, [parseError]);

	const deleteMe = useCallback(async () => {
		setAuthIsLoading(true);
		setAuthError(null);

		try {
			const response = await api.delete("/me");
			clearAuthState();
			return response?.data ?? null;
		} catch (err) {
			const message = parseError(err, "Failed to delete account");
			setAuthError(message);
			throw err;
		} finally {
			setAuthIsLoading(false);
		}
	}, [clearAuthState, parseError]);

	const logout = useCallback(async () => {
		setAuthIsLoading(true);
		setAuthError(null);

		try {
			await api.post("/logout", {});
		} catch (err) {
			setAuthError(parseError(err, "Failed to log out"));
		} finally {
			clearAuthState();
			setAuthIsLoading(false);
		}
	}, [clearAuthState, parseError]);

	useEffect(() => {
		const token = localStorage.getItem("token");

		if (!token) {
			setAuthIsLoading(false);
			setAuthIsReady(true);
			return;
		}

		loadCurrentUser().catch(() => {
			localStorage.removeItem("token");
			setCurrentUser(null);
		}).finally(() => {
			setAuthIsReady(true);
		});
	}, [loadCurrentUser]);

	useEffect(() => {
		const handleAuthLogout = () => {
			clearAuthState();
			setAuthIsLoading(false);
		};

		window.addEventListener(AUTH_LOGOUT_EVENT, handleAuthLogout);
		return () => window.removeEventListener(AUTH_LOGOUT_EVENT, handleAuthLogout);
	}, [clearAuthState]);

	const value = useMemo(() => ({
		currentUser,
		authIsReady,
		authIsLoading,
		authError,
		isAuthenticated: Boolean(currentUser),
		login,
		signUp,
		loadCurrentUser,
		updateMe,
		deleteMe,
		logout,
		clearAuthState,
		setCurrentUser,
		setAuthError,
	}), [
		currentUser,
		authIsReady,
		authIsLoading,
		authError,
		login,
		signUp,
		loadCurrentUser,
		updateMe,
		deleteMe,
		logout,
		clearAuthState,
	]);

	return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUserContext() {
	const context = useContext(UserContext);

	if (!context) {
		throw new Error("useUserContext must be used within UserProvider");
	}

	return context;
}
