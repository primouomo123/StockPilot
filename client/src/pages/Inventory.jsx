



import { useEffect, useMemo, useState } from "react";
import {
    Alert,
    Button,
    CircularProgress,
    IconButton,
    MenuItem,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";
import {
    CloseRounded,
    DeleteRounded,
    EditRounded,
    SaveRounded,
    SearchRounded,
} from "@mui/icons-material";

import { useCategoryContext } from "../contexts/CategoryContext";
import { useProductContext } from "../contexts/ProductContext";

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

            <Paper sx={{ p: { xs: 2, md: 3 } }}>
                <Stack
                    component="form"
                    onSubmit={handleCreate}
                    direction={{ xs: "column", lg: "row" }}
                    spacing={1.5}
                    useFlexGap
                    flexWrap="wrap"
                >
                    <TextField
                        label="Product name"
                        value={newProduct.name}
                        onChange={(event) => {
                            setNewProduct((current) => ({ ...current, name: event.target.value }));
                            setLocalError(null);
                        }}
                        disabled={productsIsLoading}
                    />
                    <TextField
                        label="SKU"
                        value={newProduct.sku}
                        onChange={(event) => {
                            setNewProduct((current) => ({ ...current, sku: event.target.value }));
                            setLocalError(null);
                        }}
                        disabled={productsIsLoading}
                    />
                    <TextField
                        label="Price"
                        type="number"
                        inputProps={{ min: 0.01, step: "0.01" }}
                        value={newProduct.price}
                        onChange={(event) => {
                            setNewProduct((current) => ({ ...current, price: event.target.value }));
                            setLocalError(null);
                        }}
                        disabled={productsIsLoading}
                    />
                    <TextField
                        label="Min stock"
                        type="number"
                        inputProps={{ min: 0, step: 1 }}
                        value={newProduct.minStock}
                        onChange={(event) => {
                            setNewProduct((current) => ({ ...current, minStock: event.target.value }));
                            setLocalError(null);
                        }}
                        disabled={productsIsLoading}
                    />
                    <TextField
                        label="Max stock"
                        type="number"
                        inputProps={{ min: 0, step: 1 }}
                        value={newProduct.maxStock}
                        onChange={(event) => {
                            setNewProduct((current) => ({ ...current, maxStock: event.target.value }));
                            setLocalError(null);
                        }}
                        disabled={productsIsLoading}
                    />
                    <TextField
                        select
                        label="Category"
                        value={newProduct.categoryName}
                        onChange={(event) => {
                            setNewProduct((current) => ({ ...current, categoryName: event.target.value }));
                            setLocalError(null);
                        }}
                        disabled={productsIsLoading || categoryOptions.length === 0}
                    >
                        {categoryOptions.map((name) => (
                            <MenuItem key={name} value={name}>
                                {name}
                            </MenuItem>
                        ))}
                    </TextField>
                    <Button type="submit" variant="contained" disabled={productsIsLoading}>
                        Add product
                    </Button>
                </Stack>
            </Paper>

            <Paper sx={{ p: { xs: 2, md: 3 } }}>
                <Stack
                    component="form"
                    onSubmit={handleSearch}
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1.5}
                    alignItems={{ xs: "stretch", sm: "center" }}
                >
                    <TextField
                        label="Search by name"
                        value={searchNameInput}
                        onChange={(event) => setSearchNameInput(event.target.value)}
                        disabled={productsIsLoading}
                    />
                    <TextField
                        label="Search by SKU"
                        value={searchSkuInput}
                        onChange={(event) => setSearchSkuInput(event.target.value)}
                        disabled={productsIsLoading}
                    />
                    <Button
                        type="submit"
                        variant="outlined"
                        startIcon={<SearchRounded />}
                        disabled={productsIsLoading}
                    >
                        Search
                    </Button>
                    <Button
                        type="button"
                        variant="text"
                        onClick={() => {
                            setSearchNameInput("");
                            setSearchSkuInput("");
                            setSearchNameQuery("");
                            setSearchSkuQuery("");
                            setPage(1);
                        }}
                        disabled={productsIsLoading}
                    >
                        Clear
                    </Button>
                </Stack>
            </Paper>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell width="6%">ID</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>SKU</TableCell>
                            <TableCell>Price</TableCell>
                            <TableCell>Units</TableCell>
                            <TableCell>Min / Max</TableCell>
                            <TableCell>Category</TableCell>
                            <TableCell width="20%" align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {productsIsLoading && products.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                                    <CircularProgress size={28} />
                                </TableCell>
                            </TableRow>
                        ) : products.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                                    No products found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            products.map((product) => {
                                const isEditing = editingId === product.id;

                                return (
                                    <TableRow key={product.id} hover>
                                        <TableCell>{product.id}</TableCell>
                                        <TableCell>
                                            {isEditing ? (
                                                <TextField
                                                    size="small"
                                                    value={editingProduct.name}
                                                    onChange={(event) => {
                                                        setEditingProduct((current) => ({
                                                            ...current,
                                                            name: event.target.value,
                                                        }));
                                                        setLocalError(null);
                                                    }}
                                                    disabled={productsIsLoading}
                                                />
                                            ) : (
                                                product.name
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {isEditing ? (
                                                <TextField
                                                    size="small"
                                                    value={editingProduct.sku}
                                                    onChange={(event) => {
                                                        setEditingProduct((current) => ({
                                                            ...current,
                                                            sku: event.target.value,
                                                        }));
                                                        setLocalError(null);
                                                    }}
                                                    disabled={productsIsLoading}
                                                />
                                            ) : (
                                                product.sku
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {isEditing ? (
                                                <TextField
                                                    size="small"
                                                    type="number"
                                                    inputProps={{ min: 0.01, step: "0.01" }}
                                                    value={editingProduct.price}
                                                    onChange={(event) => {
                                                        setEditingProduct((current) => ({
                                                            ...current,
                                                            price: event.target.value,
                                                        }));
                                                        setLocalError(null);
                                                    }}
                                                    disabled={productsIsLoading}
                                                />
                                            ) : (
                                                formatPrice(product.price)
                                            )}
                                        </TableCell>
                                        <TableCell>{product.total_units}</TableCell>
                                        <TableCell>
                                            {isEditing ? (
                                                <Stack direction="row" spacing={1}>
                                                    <TextField
                                                        size="small"
                                                        type="number"
                                                        inputProps={{ min: 0, step: 1 }}
                                                        value={editingProduct.minStock}
                                                        onChange={(event) => {
                                                            setEditingProduct((current) => ({
                                                                ...current,
                                                                minStock: event.target.value,
                                                            }));
                                                            setLocalError(null);
                                                        }}
                                                        disabled={productsIsLoading}
                                                    />
                                                    <TextField
                                                        size="small"
                                                        type="number"
                                                        inputProps={{ min: 0, step: 1 }}
                                                        value={editingProduct.maxStock}
                                                        onChange={(event) => {
                                                            setEditingProduct((current) => ({
                                                                ...current,
                                                                maxStock: event.target.value,
                                                            }));
                                                            setLocalError(null);
                                                        }}
                                                        disabled={productsIsLoading}
                                                    />
                                                </Stack>
                                            ) : (
                                                `${product.min_stock} / ${product.max_stock}`
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {isEditing ? (
                                                <TextField
                                                    select
                                                    size="small"
                                                    value={editingProduct.categoryName}
                                                    onChange={(event) => {
                                                        setEditingProduct((current) => ({
                                                            ...current,
                                                            categoryName: event.target.value,
                                                        }));
                                                        setLocalError(null);
                                                    }}
                                                    disabled={productsIsLoading || categoryOptions.length === 0}
                                                >
                                                    {categoryOptions.map((name) => (
                                                        <MenuItem key={name} value={name}>
                                                            {name}
                                                        </MenuItem>
                                                    ))}
                                                </TextField>
                                            ) : (
                                                product.category_name
                                            )}
                                        </TableCell>
                                        <TableCell align="right">
                                            {isEditing ? (
                                                <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                                    <IconButton
                                                        color="primary"
                                                        onClick={() => saveEdit(product.id)}
                                                        disabled={productsIsLoading}
                                                    >
                                                        <SaveRounded />
                                                    </IconButton>
                                                    <IconButton
                                                        color="inherit"
                                                        onClick={cancelEdit}
                                                        disabled={productsIsLoading}
                                                    >
                                                        <CloseRounded />
                                                    </IconButton>
                                                </Stack>
                                            ) : (
                                                <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                                    <IconButton
                                                        color="primary"
                                                        onClick={() => startEdit(product)}
                                                        disabled={productsIsLoading}
                                                    >
                                                        <EditRounded />
                                                    </IconButton>
                                                    <IconButton
                                                        color="error"
                                                        onClick={() => handleDelete(product.id, product.name)}
                                                        disabled={productsIsLoading || product.total_units > 0}
                                                    >
                                                        <DeleteRounded />
                                                    </IconButton>
                                                </Stack>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Paper sx={{ p: 2 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                    <Typography color="text.secondary">{pageLabel}</Typography>
                    <Stack direction="row" spacing={1}>
                        <Button
                            variant="outlined"
                            onClick={() => setPage((current) => Math.max(1, current - 1))}
                            disabled={productsIsLoading || page <= 1}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={() => setPage((current) => current + 1)}
                            disabled={productsIsLoading || page >= totalPages}
                        >
                            Next
                        </Button>
                    </Stack>
                </Stack>
            </Paper>
        </Stack>
    );
}