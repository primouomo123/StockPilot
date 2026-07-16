import { useCallback, useState } from "react";
import api from "../api/api";

export default function useCategories() {
  const [categories, setCategories] = useState([]);
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

  // READ
  const getCategories = useCallback(async ({ page = 1, perPage = 20, name } = {}) => {
    startRequest();

    try {
      const params = {
        page,
        per_page: perPage,
      };
      if (name) params.name = name;

      const res = await api.get("/categories", { params });

      const data = res.data ?? {};
      setCategories(data.categories ?? []);
      setPaginationFromResponse(data, page, perPage);
    } catch (err) {
      setError(parseError(err, "Fetch failed"));
    } finally {
      endRequest();
    }
  }, [endRequest, parseError, setPaginationFromResponse, startRequest]);

  // CREATE
  const createCategory = useCallback(async (data) => {
    startRequest();

    try {
      const res = await api.post("/categories", data);
      setCategories((prev) => [...prev, res.data]);
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

  // UPDATE
  const updateCategory = useCallback(async (id, data) => {
    startRequest();

    try {
      const res = await api.patch(`/categories/${id}`, data);

      setCategories((prev) =>
        prev.map((c) => (c.id === id ? res.data : c))
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

  // DELETE
  const deleteCategory = useCallback(async (id) => {
    startRequest();

    try {
      await api.delete(`/categories/${id}`);
      setCategories((prev) => {
        const next = prev.filter((c) => c.id !== id);
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
    categories,
    pagination,
    isLoading,
    error,
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };
}