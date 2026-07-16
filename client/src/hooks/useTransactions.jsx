import { useCallback, useState } from "react";
import api from "../api/api";

const INITIAL_PAGINATION = {
	page: 1,
	perPage: 20,
	total: 0,
	totalPages: 0,
	hasNext: false,
	hasPrev: false,
};

export default function useTransactions() {
	const [transactions, setTransactions] = useState([]);
	const [pendingRequests, setPendingRequests] = useState(0);
	const [pagination, setPagination] = useState(INITIAL_PAGINATION);
	const [error, setError] = useState(null);
	const isLoading = pendingRequests > 0;

	const startRequest = useCallback(() => {
		setPendingRequests((count) => count + 1);
		setError(null);
	}, []);

	const endRequest = useCallback(() => {
		setPendingRequests((count) => Math.max(0, count - 1));
	}, []);

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

	const setPaginationFromResponse = useCallback((data, fallbackPage, fallbackPerPage) => {
		const page = data?.page ?? fallbackPage;
		const perPage = data?.per_page ?? fallbackPerPage;
		const total = data?.total ?? 0;
		const totalPages = data?.total_pages ?? (perPage > 0 ? Math.ceil(total / perPage) : 0);

		setPagination({
			page,
			perPage,
			total,
			totalPages,
			hasNext: page < totalPages,
			hasPrev: page > 1,
		});
	}, []);

	const getTransactions = useCallback(async ({ page = 1, perPage = 20, startDate, endDate } = {}) => {
		startRequest();

		try {
			const params = {
				page,
				per_page: perPage,
			};

			if (startDate) params.start_date = startDate;
			if (endDate) params.end_date = endDate;

			const res = await api.get("/transactions", {
				params,
			});

			const data = res.data ?? {};
			setTransactions(data.transactions ?? []);
			setPaginationFromResponse(data, page, perPage);

			return data;
		} catch (err) {
			const message = parseError(err, "Fetch failed");
			setError(message);
			throw err;
		} finally {
			endRequest();
		}
	}, [endRequest, parseError, setPaginationFromResponse, startRequest]);

	const getTransactionById = useCallback(async (id) => {
		startRequest();

		try {
			const res = await api.get(`/transactions/${id}`);
			return res.data;
		} catch (err) {
			const message = parseError(err, "Fetch failed");
			setError(message);
			throw err;
		} finally {
			endRequest();
		}
	}, [endRequest, parseError, startRequest]);

	const createTransaction = useCallback(async (data) => {
		startRequest();

		try {
			const res = await api.post("/transactions", data);
			setTransactions((prev) => [res.data, ...prev]);
			setPagination((prev) => {
				const total = prev.total + 1;
				const totalPages = prev.perPage > 0 ? Math.ceil(total / prev.perPage) : 0;

				return {
					...prev,
					total,
					totalPages,
					hasNext: prev.page < totalPages,
					hasPrev: prev.page > 1,
				};
			});
			return res.data;
		} catch (err) {
			const message = parseError(err, "Create failed");
			setError(message);
			throw err;
		} finally {
			endRequest();
		}
	}, [endRequest, parseError, startRequest]);

	const clearTransactionsState = useCallback(() => {
		setTransactions([]);
		setPagination(INITIAL_PAGINATION);
		setError(null);
	}, []);

	return {
		transactions,
		pagination,
		isLoading,
		error,
		getTransactions,
		getTransactionById,
		createTransaction,
		clearTransactionsState,
	};
}
