import {
    Avatar,
    Button,
    CircularProgress,
    LinearProgress,
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
    Tooltip,
    Typography,
} from "@mui/material";
import {
    CloseRounded,
    DeleteRounded,
    EditRounded,
    SaveRounded,
} from "@mui/icons-material";

export default function ProductsGrid({
    products,
    productsIsLoading,
    editingId,
    editingProduct,
    onEditingProductFieldChange,
    onStartEdit,
    onSaveEdit,
    onCancelEdit,
    onDelete,
    categoryOptions,
    formatPrice,
    pageLabel,
    page,
    totalPages,
    onPrevPage,
    onNextPage,
}) {
    const handlePositiveDecimalChange = (field, value) => {
        if (value === "") {
            onEditingProductFieldChange(field, value);
            return;
        }

        const number = Number(value);
        if (Number.isNaN(number) || number < 0) return;
        onEditingProductFieldChange(field, value);
    };

    const handlePositiveIntegerChange = (field, value) => {
        if (value === "") {
            onEditingProductFieldChange(field, value);
            return;
        }

        const number = Number(value);
        if (Number.isNaN(number) || number < 0 || !Number.isInteger(number)) return;
        onEditingProductFieldChange(field, value);
    };

    return (
        <>
            <Paper sx={{ overflow: "hidden" }}>
                {productsIsLoading && <LinearProgress />}
                <TableContainer>
                    <Table>
                    <TableHead>
                        <TableRow
                            sx={{
                                "& .MuiTableCell-root": {
                                    bgcolor: (theme) =>
                                        theme.palette.mode === "dark" ? "rgba(2,136,209,0.20)" : "grey.100",
                                    fontWeight: 700,
                                    letterSpacing: "0.02em",
                                },
                            }}
                        >
                            <TableCell width="6%">ID</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>SKU</TableCell>
                            <TableCell>Price</TableCell>
                            <TableCell>Units</TableCell>
                            <TableCell>Min / Max</TableCell>
                            <TableCell>Category</TableCell>
                            <TableCell width="20%" align="left" sx={{ pl: 4 }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {productsIsLoading && products.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                                    <CircularProgress size={28} />
                                </TableCell>
                            </TableRow>
                        ) : products.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                                    <Stack spacing={0.75} alignItems="center">
                                        <Typography variant="subtitle1">No products found</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Add a product or adjust your search filters.
                                        </Typography>
                                    </Stack>
                                </TableCell>
                            </TableRow>
                        ) : (
                            products.map((product) => {
                                const isEditing = editingId === product.id;

                                return (
                                    <TableRow
                                        key={product.id}
                                        hover
                                        sx={{
                                            "&:nth-of-type(even)": {
                                                backgroundColor: (theme) =>
                                                    theme.palette.mode === "dark"
                                                        ? "rgba(255, 255, 255, 0.03)"
                                                        : "rgba(0, 0, 0, 0.01)",
                                            },
                                        }}
                                    >
                                        <TableCell>{product.id}</TableCell>
                                        <TableCell>
                                            {isEditing ? (
                                                <TextField
                                                    size="small"
                                                    value={editingProduct.name}
                                                    onChange={(event) =>
                                                        onEditingProductFieldChange("name", event.target.value)
                                                    }
                                                    disabled={productsIsLoading}
                                                />
                                            ) : (
                                                <Stack direction="row" spacing={1.1} alignItems="center">
                                                    <Avatar
                                                        sx={{
                                                            width: 28,
                                                            height: 28,
                                                            fontSize: 12,
                                                            bgcolor: "primary.light",
                                                            color: "primary.contrastText",
                                                        }}
                                                    >
                                                        {product.name.slice(0, 1).toUpperCase()}
                                                    </Avatar>
                                                    <Typography fontWeight={500}>{product.name}</Typography>
                                                </Stack>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {isEditing ? (
                                                <TextField
                                                    size="small"
                                                    value={editingProduct.sku}
                                                    onChange={(event) =>
                                                        onEditingProductFieldChange("sku", event.target.value)
                                                    }
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
                                                    onChange={(event) =>
                                                        handlePositiveDecimalChange("price", event.target.value)
                                                    }
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
                                                        inputProps={{ min: 1, step: 1 }}
                                                        value={editingProduct.minStock}
                                                        onChange={(event) =>
                                                            handlePositiveIntegerChange("minStock", event.target.value)
                                                        }
                                                        disabled={productsIsLoading}
                                                    />
                                                    <TextField
                                                        size="small"
                                                        type="number"
                                                        inputProps={{ min: 1, step: 1 }}
                                                        value={editingProduct.maxStock}
                                                        onChange={(event) =>
                                                            handlePositiveIntegerChange("maxStock", event.target.value)
                                                        }
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
                                                    onChange={(event) =>
                                                        onEditingProductFieldChange(
                                                            "categoryName",
                                                            event.target.value
                                                        )
                                                    }
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
                                                    <Tooltip title="Save">
                                                        <span>
                                                            <IconButton
                                                                color="primary"
                                                                onClick={() => onSaveEdit(product.id)}
                                                                disabled={productsIsLoading}
                                                            >
                                                                <SaveRounded />
                                                            </IconButton>
                                                        </span>
                                                    </Tooltip>
                                                    <Tooltip title="Cancel">
                                                        <span>
                                                            <IconButton
                                                                color="inherit"
                                                                onClick={onCancelEdit}
                                                                disabled={productsIsLoading}
                                                            >
                                                                <CloseRounded />
                                                            </IconButton>
                                                        </span>
                                                    </Tooltip>
                                                </Stack>
                                            ) : (
                                                <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                                    <Tooltip title="Edit product">
                                                        <span>
                                                            <IconButton
                                                                color="primary"
                                                                onClick={() => onStartEdit(product)}
                                                                disabled={productsIsLoading}
                                                            >
                                                                <EditRounded />
                                                            </IconButton>
                                                        </span>
                                                    </Tooltip>
                                                    <Tooltip title="Delete product">
                                                        <span>
                                                            <IconButton
                                                                color="error"
                                                                onClick={() => onDelete(product.id, product.name)}
                                                                disabled={productsIsLoading || product.total_units > 0}
                                                                sx={{
                                                                    "&.Mui-disabled": {
                                                                        color: "error.main",
                                                                        opacity: 0.65,
                                                                    },
                                                                }}
                                                            >
                                                                <DeleteRounded />
                                                            </IconButton>
                                                        </span>
                                                    </Tooltip>
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
            </Paper>

            <Paper sx={{ p: 2 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                    <Typography color="text.secondary">{pageLabel}</Typography>
                    <Stack direction="row" spacing={1}>
                        <Button
                            variant="outlined"
                            onClick={onPrevPage}
                            disabled={productsIsLoading || page <= 1}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={onNextPage}
                            disabled={productsIsLoading || page >= totalPages}
                        >
                            Next
                        </Button>
                    </Stack>
                </Stack>
            </Paper>
        </>
    );
}
