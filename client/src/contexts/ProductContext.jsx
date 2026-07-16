import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
} from "react";

import { AUTH_LOGOUT_EVENT } from "../api/api";
import useInventory from "../hooks/useInventory";

const ProductContext = createContext(null);

export function ProductProvider({ children }) {
	const {
		products,
		pagination,
		isLoading,
		error,
		getProducts,
		createProduct,
		updateProduct,
		deleteProduct,
		clearProductsState,
	} = useInventory();

	const resetProducts = useCallback(() => {
		clearProductsState();
	}, [clearProductsState]);

	useEffect(() => {
		const handleAuthLogout = () => {
			resetProducts();
		};

		window.addEventListener(AUTH_LOGOUT_EVENT, handleAuthLogout);
		return () => window.removeEventListener(AUTH_LOGOUT_EVENT, handleAuthLogout);
	}, [resetProducts]);

	const value = useMemo(() => ({
		products,
		productPagination: pagination,
		productsIsLoading: isLoading,
		productsError: error,
		getProducts,
		createProduct,
		updateProduct,
		deleteProduct,
		resetProducts,
		clearProductsState,
	}), [
		products,
		pagination,
		isLoading,
		error,
		getProducts,
		createProduct,
		updateProduct,
		deleteProduct,
		resetProducts,
		clearProductsState,
	]);

	return (
		<ProductContext.Provider value={value}>
			{children}
		</ProductContext.Provider>
	);
}

export function useProductContext() {
	const context = useContext(ProductContext);

	if (!context) {
		throw new Error("useProductContext must be used within ProductProvider");
	}

	return context;
}
