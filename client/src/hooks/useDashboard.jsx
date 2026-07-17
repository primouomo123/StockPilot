import { useCallback, useMemo, useState } from "react";
import api from "../api/api";

const DEFAULT_SUMMARY = {
	total_products: 0,
	total_categories: 0,
	total_units: 0,
	inventory_value: 0,
	low_stock_products: [],
	near_min_stock_products: [],
	zero_stock_products: [],
	recent_products: [],
	recent_transactions: [],
};

export default function useDashboard() {
	const [summary, setSummary] = useState(DEFAULT_SUMMARY);
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

	const normalizeSummary = useCallback((raw) => ({
		total_products: Number(raw?.total_products ?? 0),
		total_categories: Number(raw?.total_categories ?? 0),
		total_units: Number(raw?.total_units ?? 0),
		inventory_value: Number(raw?.inventory_value ?? 0),
		low_stock_products: Array.isArray(raw?.low_stock_products) ? raw.low_stock_products : [],
		near_min_stock_products: Array.isArray(raw?.near_min_stock_products) ? raw.near_min_stock_products : [],
		zero_stock_products: Array.isArray(raw?.zero_stock_products) ? raw.zero_stock_products : [],
		recent_products: Array.isArray(raw?.recent_products) ? raw.recent_products : [],
		recent_transactions: Array.isArray(raw?.recent_transactions) ? raw.recent_transactions : [],
	}), []);

	const getSummary = useCallback(async () => {
		setIsLoading(true);
		setError(null);

		try {
			const res = await api.get("/summary");
			const data = normalizeSummary(res?.data ?? {});
			setSummary(data);
			return data;
		} catch (err) {
			const message = parseError(err, "Failed to load dashboard summary");
			setError(message);
			throw err;
		} finally {
			setIsLoading(false);
		}
	}, [normalizeSummary, parseError]);

	const resetSummary = useCallback(() => {
		setSummary(DEFAULT_SUMMARY);
		setError(null);
	}, []);

	const stats = useMemo(() => ({
		totalProducts: summary.total_products,
		totalCategories: summary.total_categories,
		totalUnits: summary.total_units,
		inventoryValue: summary.inventory_value,
	}), [summary]);

	return {
		summary,
		stats,
		isLoading,
		error,
		getSummary,
		resetSummary,
	};
}
