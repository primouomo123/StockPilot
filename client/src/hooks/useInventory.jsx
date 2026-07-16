import { useCallback, useState } from "react";
import api from "../api/api";

export default function useInventory() {
	const [products, setProducts] = useState([]);
	const [pendingRequests, setPendingRequests] = useState(0);
	const [pagination, setPagination] = useState({
		page: 1,
		perPage: 20,
		total: 0,
		totalPages: 0,
		hasNext: false,
		hasPrev: false,
	});
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

	const getProducts = useCallback(async ({ page = 1, perPage = 20, name, sku } = {}) => {
		startRequest();

		try {
			const params = {
				page,
				per_page: perPage,
			};

			if (name) params.name = name;
			if (sku) params.sku = sku;

			const res = await api.get("/products", { params });
			const data = res.data ?? {};

			setProducts(data.products ?? []);
			setPaginationFromResponse(data, page, perPage);

			return data;
		} catch (err) {
			setError(parseError(err, "Fetch failed"));
			throw err;
		} finally {
			endRequest();
		}
	}, [endRequest, parseError, setPaginationFromResponse, startRequest]);

	const createProduct = useCallback(async (data) => {
		startRequest();

		try {
			const res = await api.post("/products", data);
			setProducts((prev) => [...prev, res.data]);
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

	const updateProduct = useCallback(async (id, data) => {
		startRequest();

		try {
			const res = await api.patch(`/products/${id}`, data);

			setProducts((prev) =>
				prev.map((product) => (product.id === id ? res.data : product))
			);

			return res.data;
		} catch (err) {
			const message = parseError(err, "Update failed");
			setError(message);
			throw err;
		} finally {
			endRequest();
		}
	}, [endRequest, parseError, startRequest]);

	const deleteProduct = useCallback(async (id) => {
		startRequest();

		try {
			await api.delete(`/products/${id}`);

			setProducts((prev) => {
				const next = prev.filter((product) => product.id !== id);
				const removed = next.length !== prev.length;

				if (removed) {
					setPagination((current) => {
						const total = Math.max(0, current.total - 1);
						const totalPages = current.perPage > 0 ? Math.ceil(total / current.perPage) : 0;
						const page = Math.min(current.page, Math.max(1, totalPages || 1));

						return {
							...current,
							page,
							total,
							totalPages,
							hasNext: page < totalPages,
							hasPrev: page > 1,
						};
					});
				}

				return next;
			});
		} catch (err) {
			const message = parseError(err, "Delete failed");
			setError(message);
			throw err;
		} finally {
			endRequest();
		}
	}, [endRequest, parseError, startRequest]);

	return {
		products,
		pagination,
		isLoading,
		error,
		getProducts,
		createProduct,
		updateProduct,
		deleteProduct,
	};
}



