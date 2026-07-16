import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
} from "react";

import { AUTH_LOGOUT_EVENT } from "../api/api";
import useCategories from "../hooks/useCategories";

const CategoryContext = createContext(null);

export function CategoryProvider({ children }) {
	const {
		categories,
		pagination,
		isLoading,
		error,
		getCategories,
		createCategory,
		updateCategory,
		deleteCategory,
		clearCategoriesState,
	} = useCategories();

	const resetCategories = useCallback(() => {
		clearCategoriesState();
	}, [clearCategoriesState]);

	useEffect(() => {
		const handleAuthLogout = () => {
			resetCategories();
		};

		window.addEventListener(AUTH_LOGOUT_EVENT, handleAuthLogout);
		return () => window.removeEventListener(AUTH_LOGOUT_EVENT, handleAuthLogout);
	}, [resetCategories]);

	const value = useMemo(() => ({
		categories,
		categoryPagination: pagination,
		categoriesIsLoading: isLoading,
		categoriesError: error,
		getCategories,
		createCategory,
		updateCategory,
		deleteCategory,
		resetCategories,
		clearCategoriesState,
	}), [
		categories,
		pagination,
		isLoading,
		error,
		getCategories,
		createCategory,
		updateCategory,
		deleteCategory,
		resetCategories,
		clearCategoriesState,
	]);

	return (
		<CategoryContext.Provider value={value}>
			{children}
		</CategoryContext.Provider>
	);
}

export function useCategoryContext() {
	const context = useContext(CategoryContext);

	if (!context) {
		throw new Error("useCategoryContext must be used within CategoryProvider");
	}

	return context;
}
