import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
} from "react";

import { AUTH_LOGOUT_EVENT } from "../api/api";
import useTransactions from "../hooks/useTransactions";

const TransactionContext = createContext(null);

export function TransactionProvider({ children }) {
	const {
		transactions,
		pagination,
		isLoading,
		error,
		getTransactions,
		getTransactionById,
		createTransaction,
		clearTransactionsState,
	} = useTransactions();

	const resetTransactions = useCallback(() => {
		clearTransactionsState();
	}, [clearTransactionsState]);

	useEffect(() => {
		const handleAuthLogout = () => {
			resetTransactions();
		};

		window.addEventListener(AUTH_LOGOUT_EVENT, handleAuthLogout);
		return () => window.removeEventListener(AUTH_LOGOUT_EVENT, handleAuthLogout);
	}, [resetTransactions]);

	const value = useMemo(() => ({
		transactions,
		transactionPagination: pagination,
		transactionsIsLoading: isLoading,
		transactionsError: error,
		getTransactions,
		getTransactionById,
		createTransaction,
		resetTransactions,
		clearTransactionsState,
	}), [
		transactions,
		pagination,
		isLoading,
		error,
		getTransactions,
		getTransactionById,
		createTransaction,
		resetTransactions,
		clearTransactionsState,
	]);

	return (
		<TransactionContext.Provider value={value}>
			{children}
		</TransactionContext.Provider>
	);
}

export function useTransactionContext() {
	const context = useContext(TransactionContext);

	if (!context) {
		throw new Error("useTransactionContext must be used within TransactionProvider");
	}

	return context;
}
