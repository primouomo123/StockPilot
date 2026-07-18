



import { useEffect, useMemo, useState } from "react";
import {
    Alert,
    Stack,
    Typography,
} from "@mui/material";

import { useCategoryContext } from "../contexts/CategoryContext";
import { useProductContext } from "../contexts/ProductContext";
import AddProductForm from "../components/AddProductForm";
import SearchProductsForm from "../components/SearchProductsForm";
import ProductsGrid from "../components/ProductsGrid";

const EMPTY_PRODUCT_FORM = {
    name: "",
    sku: "",
    price: "",
    minStock: "",
    maxStock: "",
    categoryName: "",
};

export default function Inventory() {
    const {
        products,
        productPagination,
        productsIsLoading,
        productsError,
        getProducts,
        createProduct,
        updateProduct,
        deleteProduct,
    } = useProductContext();

    const { categories, getCategories } = useCategoryContext();

    const [newProduct, setNewProduct] = useState(EMPTY_PRODUCT_FORM);
    const [searchNameInput, setSearchNameInput] = useState("");
    const [searchSkuInput, setSearchSkuInput] = useState("");
    const [searchNameQuery, setSearchNameQuery] = useState("");
    const [searchSkuQuery, setSearchSkuQuery] = useState("");
    const [page, setPage] = useState(1);
    const [localError, setLocalError] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editingProduct, setEditingProduct] = useState(EMPTY_PRODUCT_FORM);

    useEffect(() => {
        getProducts({
            page,
            perPage: 10,
            name: searchNameQuery || undefined,
            sku: searchSkuQuery || undefined,
        }).catch(() => {
            // Error state is already handled in ProductContext.
        });
    }, [getProducts, page, searchNameQuery, searchSkuQuery]);

    useEffect(() => {
        if (categories.length > 0) return;

        getCategories({ page: 1, perPage: 200 }).catch(() => {
            // Error state is already handled in CategoryContext.
        });
    }, [categories.length, getCategories]);

    const totalPages = productPagination?.totalPages || 1;
    const pageLabel = useMemo(() => {
        const total = productPagination?.total ?? 0;
        if (total === 0) return "No products found";
        return `Page ${productPagination.page} of ${totalPages} (${total} total)`;
    }, [productPagination, totalPages]);

    const categoryOptions = useMemo(
        () => categories.map((category) => category.name).sort((a, b) => a.localeCompare(b)),
        [categories]
    );

    const validateProductForm = (form) => {
        const name = form.name.trim();
        const sku = form.sku.trim().toUpperCase();
        const categoryName = form.categoryName.trim();

        if (!name || !sku || !form.price || !form.minStock || !form.maxStock || !categoryName) {
            return { error: "All product fields are required." };
        }

        const price = Number(form.price);
        const minStock = Number(form.minStock);
        const maxStock = Number(form.maxStock);

        if (Number.isNaN(price) || price <= 0) {
            return { error: "Price must be greater than 0." };
        }

        if (Number.isNaN(minStock) || minStock < 0 || Number.isNaN(maxStock) || maxStock < 0) {
            return { error: "Min stock and max stock must be 0 or greater." };
        }

        if (minStock > maxStock) {
            return { error: "Min stock cannot be greater than max stock." };
        }

        return {
            payload: {
                name,
                sku,
                price,
                min_stock: minStock,
                max_stock: maxStock,
                category_name: categoryName,
            },
        };
    };

    const handleCreate = async (event) => {
        event.preventDefault();
        setLocalError(null);

        const { payload, error } = validateProductForm(newProduct);
        if (error) {
            setLocalError(error);
            return;
        }

        try {
            await createProduct(payload);
            setNewProduct(EMPTY_PRODUCT_FORM);
            await getProducts({
                page,
                perPage: 10,
                name: searchNameQuery || undefined,
                sku: searchSkuQuery || undefined,
            });
        } catch {
            // Error state is already handled in ProductContext.
        }
    };

    const handleSearch = (event) => {
        event.preventDefault();
        setPage(1);
        setSearchNameQuery(searchNameInput.trim());
        setSearchSkuQuery(searchSkuInput.trim().toUpperCase());
    };

    const startEdit = (product) => {
        setEditingId(product.id);
        setEditingProduct({
            name: product.name ?? "",
            sku: product.sku ?? "",
            price: product.price ?? "",
            minStock: String(product.min_stock ?? ""),
            maxStock: String(product.max_stock ?? ""),
            categoryName: product.category_name ?? "",
        });
        setLocalError(null);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditingProduct(EMPTY_PRODUCT_FORM);
    };

    const saveEdit = async (productId) => {
        const { payload, error } = validateProductForm(editingProduct);
        if (error) {
            setLocalError(error);
            return;
        }

        try {
            await updateProduct(productId, payload);
            cancelEdit();
        } catch {
            // Error state is already handled in ProductContext.
        }
    };

    const handleDelete = async (productId, productName) => {
        const confirmed = window.confirm(
            `Delete product "${productName}"? This action cannot be undone.`
        );
        if (!confirmed) return;

        try {
            await deleteProduct(productId);
            const nextPage = products.length === 1 && page > 1 ? page - 1 : page;

            if (nextPage !== page) {
                setPage(nextPage);
            } else {
                await getProducts({
                    page,
                    perPage: 10,
                    name: searchNameQuery || undefined,
                    sku: searchSkuQuery || undefined,
                });
            }
        } catch {
            // Error state is already handled in ProductContext.
        }
    };

    const formatPrice = (value) => {
        const number = Number(value);
        if (Number.isNaN(number)) return value;
        return `$${number.toFixed(2)}`;
    };

    return (
        <Stack spacing={3}>
            <Stack spacing={0.5}>
                <Typography variant="h4">Inventory</Typography>
                <Typography color="text.secondary">
                    Track products, pricing, category assignment, and stock limits.
                </Typography>
            </Stack>

            {(localError || productsError) && (
                <Alert severity="error">{localError || productsError}</Alert>
            )}

            <AddProductForm
                product={newProduct}
                onFieldChange={(field, value) => {
                    setNewProduct((current) => ({ ...current, [field]: value }));
                    setLocalError(null);
                }}
                onSubmit={handleCreate}
                categoryOptions={categoryOptions}
                disabled={productsIsLoading}
            />

            <SearchProductsForm
                searchNameInput={searchNameInput}
                searchSkuInput={searchSkuInput}
                onSearchNameChange={(value) => setSearchNameInput(value)}
                onSearchSkuChange={(value) => setSearchSkuInput(value)}
                onSubmit={handleSearch}
                onClear={() => {
                    setSearchNameInput("");
                    setSearchSkuInput("");
                    setSearchNameQuery("");
                    setSearchSkuQuery("");
                    setPage(1);
                }}
                disabled={productsIsLoading}
            />

            <ProductsGrid
                products={products}
                productsIsLoading={productsIsLoading}
                editingId={editingId}
                editingProduct={editingProduct}
                onEditingProductFieldChange={(field, value) => {
                    setEditingProduct((current) => ({ ...current, [field]: value }));
                    setLocalError(null);
                }}
                onStartEdit={startEdit}
                onSaveEdit={saveEdit}
                onCancelEdit={cancelEdit}
                onDelete={handleDelete}
                categoryOptions={categoryOptions}
                formatPrice={formatPrice}
                pageLabel={pageLabel}
                page={page}
                totalPages={totalPages}
                onPrevPage={() => setPage((current) => Math.max(1, current - 1))}
                onNextPage={() => setPage((current) => current + 1)}
            />
        </Stack>
    );
}