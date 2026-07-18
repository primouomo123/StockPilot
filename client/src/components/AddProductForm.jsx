import { Button, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";

export default function AddProductForm({
    product,
    onFieldChange,
    onSubmit,
    categoryOptions,
    disabled,
}) {
    return (
        <Paper sx={{ p: { xs: 2, md: 2.5 }, flex: 1 }}>
            <Stack spacing={1.5}>
                <Typography variant="h6">Add product</Typography>
                <Typography variant="body2" color="text.secondary">
                    Create a product with pricing, stock thresholds, and category mapping.
                </Typography>

                <Stack
                    component="form"
                    onSubmit={onSubmit}
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1.5}
                    useFlexGap
                    flexWrap="wrap"
                >
                    <TextField
                        label="Product name"
                        sx={{ minWidth: { sm: 190 } }}
                        value={product.name}
                        onChange={(event) => onFieldChange("name", event.target.value)}
                        disabled={disabled}
                    />
                    <TextField
                        label="SKU"
                        sx={{ minWidth: { sm: 140 } }}
                        value={product.sku}
                        onChange={(event) => onFieldChange("sku", event.target.value)}
                        disabled={disabled}
                    />
                    <TextField
                        label="Price"
                        type="number"
                        inputProps={{ min: 0.01, step: "0.01" }}
                        sx={{ minWidth: { sm: 120 } }}
                        value={product.price}
                        onChange={(event) => onFieldChange("price", event.target.value)}
                        disabled={disabled}
                    />
                    <TextField
                        label="Min stock"
                        type="number"
                        inputProps={{ min: 0, step: 1 }}
                        sx={{ minWidth: { sm: 120 } }}
                        value={product.minStock}
                        onChange={(event) => onFieldChange("minStock", event.target.value)}
                        disabled={disabled}
                    />
                    <TextField
                        label="Max stock"
                        type="number"
                        inputProps={{ min: 0, step: 1 }}
                        sx={{ minWidth: { sm: 120 } }}
                        value={product.maxStock}
                        onChange={(event) => onFieldChange("maxStock", event.target.value)}
                        disabled={disabled}
                    />
                    <TextField
                        select
                        label="Category"
                        sx={{ minWidth: { sm: 180 } }}
                        value={product.categoryName}
                        onChange={(event) => onFieldChange("categoryName", event.target.value)}
                        disabled={disabled || categoryOptions.length === 0}
                    >
                        {categoryOptions.map((name) => (
                            <MenuItem key={name} value={name}>
                                {name}
                            </MenuItem>
                        ))}
                    </TextField>
                    <Button type="submit" variant="contained" disabled={disabled} sx={{ minWidth: 140 }}>
                        Add product
                    </Button>
                </Stack>
            </Stack>
        </Paper>
    );
}
