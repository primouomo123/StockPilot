import { AddRounded } from "@mui/icons-material";
import { Autocomplete, Button, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";

export default function AddTransactionForm({
    transaction,
    transactionTypes,
    productOptions,
    onFieldChange,
    onSubmit,
    disabled,
}) {
    const handlePositiveIntegerChange = (value) => {
        if (value === "") {
            onFieldChange("quantityChange", value);
            return;
        }

        const number = Number(value);
        if (Number.isNaN(number) || number < 0 || !Number.isInteger(number)) return;
        onFieldChange("quantityChange", value);
    };

    return (
        <Paper sx={{ p: { xs: 2, md: 2.5 } }}>
            <Stack spacing={1.5}>
                <Typography variant="h6">Add transaction</Typography>
                <Typography variant="body2" color="text.secondary">
                    Record stock movement by product, type, and quantity.
                </Typography>

                <Stack
                    component="form"
                    onSubmit={onSubmit}
                    direction={{ xs: "column", lg: "row" }}
                    spacing={1.5}
                    useFlexGap
                    flexWrap="wrap"
                >
                    <Autocomplete
                        options={productOptions}
                        sx={{ minWidth: { sm: 240 } }}
                        value={transaction.productName || null}
                        onChange={(_, nextValue) => onFieldChange("productName", nextValue || "")}
                        disabled={disabled || productOptions.length === 0}
                        renderInput={(params) => <TextField {...params} label="Product" />}
                    />

                    <TextField
                        select
                        label="Type"
                        sx={{ minWidth: { sm: 160 } }}
                        value={transaction.transactionType}
                        onChange={(event) => onFieldChange("transactionType", event.target.value)}
                        disabled={disabled}
                    >
                        {transactionTypes.map((type) => (
                            <MenuItem key={type} value={type}>
                                {type}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        label="Quantity"
                        type="number"
                        inputProps={{ min: 1, step: 1 }}
                        sx={{ minWidth: { sm: 140 } }}
                        value={transaction.quantityChange}
                        onChange={(event) => handlePositiveIntegerChange(event.target.value)}
                        disabled={disabled}
                    />

                    <Button
                        type="submit"
                        variant="contained"
                        startIcon={<AddRounded />}
                        disabled={disabled}
                        sx={{ minWidth: 170 }}
                    >
                        Add transaction
                    </Button>
                </Stack>
            </Stack>
        </Paper>
    );
}
