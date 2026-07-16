import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
} from "react";

import { AUTH_LOGOUT_EVENT } from "../api/api";
import useDashboard from "../hooks/useDashboard";

const DashboardContext = createContext(null);

export function DashboardProvider({ children }) {
	const {
		summary,
		stats,
		isLoading,
		error,
		getSummary,
		resetSummary,
	} = useDashboard();

	const resetDashboard = useCallback(() => {
		resetSummary();
	}, [resetSummary]);

	useEffect(() => {
		const handleAuthLogout = () => {
			resetDashboard();
		};

		window.addEventListener(AUTH_LOGOUT_EVENT, handleAuthLogout);
		return () => window.removeEventListener(AUTH_LOGOUT_EVENT, handleAuthLogout);
	}, [resetDashboard]);

	const value = useMemo(() => ({
		summary,
		stats,
		dashboardIsLoading: isLoading,
		dashboardError: error,
		getSummary,
		resetDashboard,
		resetSummary,
	}), [
		summary,
		stats,
		isLoading,
		error,
		getSummary,
		resetDashboard,
		resetSummary,
	]);

	return (
		<DashboardContext.Provider value={value}>
			{children}
		</DashboardContext.Provider>
	);
}

export function useDashboardContext() {
	const context = useContext(DashboardContext);

	if (!context) {
		throw new Error("useDashboardContext must be used within DashboardProvider");
	}

	return context;
}
