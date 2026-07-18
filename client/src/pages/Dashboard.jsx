
import { useEffect, useMemo, useState } from "react";
import {
    Alert,
    Avatar,
    Box,
    Button,
    Chip,
    CircularProgress,
    Divider,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    LinearProgress,
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
    CategoryRounded,
    EditRounded,
    Inventory2Rounded,
    SaveRounded,
    SellRounded,
    WarningAmberRounded,
} from "@mui/icons-material";

import { useCategoryContext } from "../contexts/CategoryContext";
import { useProductContext } from "../contexts/ProductContext";
import { useDashboardContext } from "../contexts/DashboardContext";

const EMPTY_PRODUCT_FORM = {
    name: "",
    sku: "",
    price: "",
    minStock: "",
    maxStock: "",
    categoryName: "",
};

function StatCard({ title, value, subtitle, icon }) {
    return (
        <Paper
            sx={{
                p: 2.5,
                border: 1,
                borderColor: "divider",
                borderRadius: 2,
                height: "100%",
            }}
        >
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                <Box>
                    <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 0.6 }}>
                        {title}
                    </Typography>
                    <Typography variant="h5" sx={{ mt: 0.5, fontWeight: 700 }}>
                        {value}
                    </Typography>
                    {subtitle && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {subtitle}
                        </Typography>
                    )}
                </Box>
                <Avatar variant="rounded" sx={{ bgcolor: "action.hover", color: "text.primary", width: 40, height: 40 }}>
                    {icon}
                </Avatar>
            </Stack>
        </Paper>
    );
}

function ProductListCard({ title, products, emptyMessage, severity = "default", onEdit }) {
    const colorMap = {
        default: "default",
        warning: "warning",
        error: "error",
        success: "success",
    };

    return (
        <Paper sx={{ p: 2.5, border: 1, borderColor: "divider", borderRadius: 2, height: "100%" }}>
            <Stack spacing={1.5}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="h6">{title}</Typography>
                    <Chip size="small" label={`${products.length}`} color={colorMap[severity]} />
                </Stack>

                {products.length === 0 ? (
                    <Typography color="text.secondary">{emptyMessage}</Typography>
                ) : (
                    <Stack spacing={1}>
                        {products.map((product) => (
                            <Paper
                                key={product.id}
                                variant="outlined"
                                sx={{
                                    p: 1.25,
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    borderRadius: 2,
                                    transition: "background-color 120ms ease",
                                    "&:hover": { backgroundColor: "action.hover" },
                                }}
                            >
                                <Box>
                                    <Typography fontWeight={600}>{product.name}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        SKU: {product.sku}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Min / Max: {product.min_stock} / {product.max_stock}
                                    </Typography>
                                </Box>
                                <Stack spacing={1} alignItems="flex-end">
                                    <Typography fontWeight={700}>{product.total_units} u</Typography>
                                    {onEdit ? (
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            startIcon={<EditRounded />}
                                            onClick={() => onEdit(product)}
                                        >
                                            Edit
                                        </Button>
                                    ) : null}
                                </Stack>
                            </Paper>
                        ))}
                    </Stack>
                )}
            </Stack>
        </Paper>
    );
}

export default function Dashboard() {
    const { summary, stats, dashboardIsLoading, dashboardError, getSummary } = useDashboardContext();
    const { categories, getCategories } = useCategoryContext();
    const { updateProduct } = useProductContext();
    const [localError, setLocalError] = useState(null);
    const [editingProductId, setEditingProductId] = useState(null);
    const [editingProduct, setEditingProduct] = useState(EMPTY_PRODUCT_FORM);

    useEffect(() => {
        getSummary().catch(() => {
            // Error state is already managed in DashboardContext.
        });
    }, [getSummary]);

    useEffect(() => {
        if (categories.length > 0) return;

        getCategories({ page: 1, perPage: 200 }).catch(() => {
            // Error state is already managed in CategoryContext.
        });
    }, [categories.length, getCategories]);

    const inventoryValueLabel = useMemo(() => {
        const number = Number(stats.inventoryValue ?? 0);
        if (Number.isNaN(number)) return "$0.00";
        return `$${number.toFixed(2)}`;
    }, [stats.inventoryValue]);

    const recentTransactions = summary.recent_transactions ?? [];
    const recentProducts = summary.recent_products ?? [];
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

    const startEdit = (product) => {
        setEditingProductId(product.id);
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

    const closeEdit = () => {
        setEditingProductId(null);
        setEditingProduct(EMPTY_PRODUCT_FORM);
    };

    const saveEdit = async () => {
        const { payload, error } = validateProductForm(editingProduct);
        if (error) {
            setLocalError(error);
            return;
        }

        try {
            await updateProduct(editingProductId, payload);
            closeEdit();
            await getSummary();
        } catch {
            // Error state is already handled in ProductContext.
        }
    };

    return (
        <Stack spacing={3}>
            <Paper sx={{ p: { xs: 2.25, md: 3 }, border: 1, borderColor: "divider", borderRadius: 2 }}>
                <Stack spacing={2}>
                    <Stack
                        direction={{ xs: "column", sm: "row" }}
                        justifyContent="space-between"
                        alignItems={{ xs: "flex-start", sm: "center" }}
                        spacing={1.5}
                    >
                        <Stack spacing={0.5}>
                            <Typography variant="h4">Dashboard</Typography>
                            <Typography color="text.secondary">
                                Overview of stock health, inventory value, and recent activity.
                            </Typography>
                        </Stack>
                    </Stack>

                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        <Chip size="small" label={`${stats.totalProducts} products`} variant="outlined" color="primary" />
                        <Chip size="small" label={`${stats.totalCategories} categories`} variant="outlined" />
                        <Chip size="small" label={`${stats.totalUnits} units in stock`} variant="outlined" color="warning" />
                    </Stack>
                </Stack>
            </Paper>

            {(localError || dashboardError) && <Alert severity="error">{localError || dashboardError}</Alert>}

            {dashboardIsLoading ? <LinearProgress /> : null}

            {dashboardIsLoading && !dashboardError ? (
                <Paper sx={{ py: 6 }}>
                    <Stack alignItems="center" spacing={1.5}>
                        <CircularProgress size={30} />
                        <Typography color="text.secondary">Loading dashboard summary...</Typography>
                    </Stack>
                </Paper>
            ) : null}

            <Box
                sx={{
                    display: "grid",
                    gap: 2,
                    gridTemplateColumns: {
                        xs: "1fr",
                        sm: "repeat(2, 1fr)",
                        lg: "repeat(4, 1fr)",
                    },
                }}
            >
                <StatCard
                    title="Total Products"
                    value={stats.totalProducts}
                    subtitle="Tracked in inventory"
                    icon={<Inventory2Rounded />}
                />
                <StatCard
                    title="Total Categories"
                    value={stats.totalCategories}
                    subtitle="Organized groups"
                    icon={<CategoryRounded />}
                />
                <StatCard
                    title="Total Units"
                    value={stats.totalUnits}
                    subtitle="Current stock count"
                    icon={<WarningAmberRounded />}
                />
                <StatCard
                    title="Inventory Value"
                    value={inventoryValueLabel}
                    subtitle="Based on price x stock"
                    icon={<SellRounded />}
                />
            </Box>

            <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="h6">Stock Alerts</Typography>
                <Typography variant="body2" color="text.secondary">
                    Products that need attention
                </Typography>
            </Stack>

            <Box
                sx={{
                    display: "grid",
                    gap: 2,
                    gridTemplateColumns: {
                        xs: "1fr",
                        lg: "repeat(3, 1fr)",
                    },
                }}
            >
                <ProductListCard
                    title="Zero Stock"
                    products={summary.zero_stock_products ?? []}
                    emptyMessage="No products are out of stock."
                    severity="error"
                    onEdit={startEdit}
                />
                <ProductListCard
                    title="Low Stock"
                    products={summary.low_stock_products ?? []}
                    emptyMessage="No products are below minimum stock."
                    severity="warning"
                    onEdit={startEdit}
                />
                <ProductListCard
                    title="Near Minimum Stock"
                    products={summary.near_min_stock_products ?? []}
                    emptyMessage="No products are near minimum stock buffer."
                    severity="success"
                    onEdit={startEdit}
                />
            </Box>

            <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="h6">Recent Activity</Typography>
                <Typography variant="body2" color="text.secondary">
                    Latest catalog and stock movement updates
                </Typography>
            </Stack>

            <Box
                sx={{
                    display: "grid",
                    gap: 2,
                    gridTemplateColumns: {
                        xs: "1fr",
                        xl: "repeat(2, 1fr)",
                    },
                }}
            >
                <Paper sx={{ border: 1, borderColor: "divider", borderRadius: 2, overflow: "hidden" }}>
                    <Box sx={{ px: 2.5, py: 1.5 }}>
                        <Typography variant="subtitle1" fontWeight={700}>
                            Recent Products
                        </Typography>
                    </Box>
                    <Divider />
                    <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ "& .MuiTableCell-root": { fontWeight: 700, bgcolor: "grey.100" } }}>
                                <TableCell>Name</TableCell>
                                <TableCell>SKU</TableCell>
                                <TableCell>Category</TableCell>
                                <TableCell align="right">Units</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {recentProducts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                                        No recent products found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                recentProducts.map((product) => (
                                    <TableRow
                                        key={product.id}
                                        hover
                                        sx={{ "&:nth-of-type(even)": { backgroundColor: "rgba(0, 0, 0, 0.015)" } }}
                                    >
                                        <TableCell>{product.name}</TableCell>
                                        <TableCell>{product.sku}</TableCell>
                                        <TableCell>{product.category_name}</TableCell>
                                        <TableCell align="right">{product.total_units}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                    </TableContainer>
                </Paper>

                <Paper sx={{ border: 1, borderColor: "divider", borderRadius: 2, overflow: "hidden" }}>
                    <Box sx={{ px: 2.5, py: 1.5 }}>
                        <Typography variant="subtitle1" fontWeight={700}>
                            Recent Transactions
                        </Typography>
                    </Box>
                    <Divider />
                    <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ "& .MuiTableCell-root": { fontWeight: 700, bgcolor: "grey.100" } }}>
                                <TableCell>Product</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell align="right">Quantity</TableCell>
                                <TableCell>Date</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {recentTransactions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                                        No recent transactions found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                recentTransactions.map((transaction) => {
                                    const date = transaction.created_at
                                        ? new Date(transaction.created_at).toLocaleString()
                                        : "-";

                                    return (
                                        <TableRow
                                            key={transaction.id}
                                            hover
                                            sx={{ "&:nth-of-type(even)": { backgroundColor: "rgba(0, 0, 0, 0.015)" } }}
                                        >
                                            <TableCell>{transaction.product_name}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    size="small"
                                                    label={transaction.transaction_type}
                                                    color={transaction.transaction_type === "Stock Out" ? "warning" : "success"}
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                            <TableCell align="right">{transaction.quantity_change}</TableCell>
                                            <TableCell>{date}</TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                    </TableContainer>
                </Paper>
            </Box>

            <Dialog open={editingProductId !== null} onClose={closeEdit} fullWidth maxWidth="sm">
                <DialogTitle sx={{ pr: 6 }}>
                    Update Product
                    <IconButton
                        aria-label="close"
                        onClick={closeEdit}
                        sx={{ position: "absolute", right: 8, top: 8 }}
                    >
                        <CloseRounded />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <TextField
                            label="Product name"
                            value={editingProduct.name}
                            onChange={(event) => {
                                setEditingProduct((current) => ({ ...current, name: event.target.value }));
                                setLocalError(null);
                            }}
                        />
                        <TextField
                            label="SKU"
                            value={editingProduct.sku}
                            onChange={(event) => {
                                setEditingProduct((current) => ({ ...current, sku: event.target.value }));
                                setLocalError(null);
                            }}
                        />
                        <TextField
                            label="Price"
                            type="number"
                            inputProps={{ min: 0.01, step: "0.01" }}
                            value={editingProduct.price}
                            onChange={(event) => {
                                setEditingProduct((current) => ({ ...current, price: event.target.value }));
                                setLocalError(null);
                            }}
                        />
                        <TextField
                            label="Min stock"
                            type="number"
                            inputProps={{ min: 0, step: 1 }}
                            value={editingProduct.minStock}
                            onChange={(event) => {
                                setEditingProduct((current) => ({ ...current, minStock: event.target.value }));
                                setLocalError(null);
                            }}
                        />
                        <TextField
                            label="Max stock"
                            type="number"
                            inputProps={{ min: 0, step: 1 }}
                            value={editingProduct.maxStock}
                            onChange={(event) => {
                                setEditingProduct((current) => ({ ...current, maxStock: event.target.value }));
                                setLocalError(null);
                            }}
                        />
                        <TextField
                            select
                            label="Category"
                            value={editingProduct.categoryName}
                            onChange={(event) => {
                                setEditingProduct((current) => ({ ...current, categoryName: event.target.value }));
                                setLocalError(null);
                            }}
                            disabled={categoryOptions.length === 0}
                        >
                            {categoryOptions.map((name) => (
                                <MenuItem key={name} value={name}>
                                    {name}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={closeEdit}>Cancel</Button>
                    <Button
                        variant="contained"
                        startIcon={<SaveRounded />}
                        onClick={saveEdit}
                        disabled={dashboardIsLoading}
                    >
                        Save changes
                    </Button>
                </DialogActions>
            </Dialog>
        </Stack>
    );
}