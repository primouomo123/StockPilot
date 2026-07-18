


import { useEffect, useMemo, useState } from "react";
import {
    Alert,
    Button,
    CircularProgress,
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
    AddRounded,
    FilterAltRounded,
} from "@mui/icons-material";

import { useProductContext } from "../contexts/ProductContext";
import { useTransactionContext } from "../contexts/TransactionContext";

const TRANSACTION_TYPES = ["Stock In", "Stock Out"];

const EMPTY_TRANSACTION_FORM = {
    productName: "",
    transactionType: "Stock In",
    quantityChange: "",
};

export default function Transactions() {
    const {
        transactions,
        transactionPagination,
        transactionsIsLoading,
        transactionsError,
        getTransactions,
        createTransaction,
    } = useTransactionContext();

    const { products, getProducts } = useProductContext();

    const [newTransaction, setNewTransaction] = useState(EMPTY_TRANSACTION_FORM);
    const [startDateInput, setStartDateInput] = useState("");
    const [endDateInput, setEndDateInput] = useState("");
    const [startDateQuery, setStartDateQuery] = useState("");
    const [endDateQuery, setEndDateQuery] = useState("");
    const [page, setPage] = useState(1);
    const [localError, setLocalError] = useState(null);

    useEffect(() => {
        getTransactions({
            page,
            perPage: 10,
            startDate: startDateQuery || undefined,
            endDate: endDateQuery || undefined,
        }).catch(() => {
            // Error state is already managed in TransactionContext.
        });
    }, [getTransactions, page, startDateQuery, endDateQuery]);

    useEffect(() => {
        if (products.length > 0) return;

        getProducts({ page: 1, perPage: 200 }).catch(() => {
            // Error state is already managed in ProductContext.
        });
    }, [getProducts, products.length]);

    const totalPages = transactionPagination?.totalPages || 1;

    const pageLabel = useMemo(() => {
        const total = transactionPagination?.total ?? 0;
        if (total === 0) return "No transactions found";
        return `Page ${transactionPagination.page} of ${totalPages} (${total} total)`;
    }, [transactionPagination, totalPages]);

    const productOptions = useMemo(() => {
        const names = new Set(products.map((product) => product.name).filter(Boolean));
        return Array.from(names).sort((a, b) => a.localeCompare(b));
    }, [products]);

    const validateTransaction = (form) => {
        const productName = form.productName.trim();
        const transactionType = form.transactionType;
        const quantity = Number(form.quantityChange);

        if (!productName || !transactionType || !form.quantityChange) {
            return { error: "Product, transaction type, and quantity are required." };
        }

        if (!TRANSACTION_TYPES.includes(transactionType)) {
            return { error: "Invalid transaction type selected." };
        }

        if (!Number.isInteger(quantity) || quantity <= 0) {
            return { error: "Quantity must be a positive whole number." };
        }

        return {
            payload: {
                product_name: productName,
                transaction_type: transactionType,
                quantity_change: quantity,
            },
        };
    };

    const handleCreate = async (event) => {
        event.preventDefault();
        setLocalError(null);

        const { payload, error } = validateTransaction(newTransaction);
        if (error) {
            setLocalError(error);
            return;
        }

        try {
            await createTransaction(payload);
            setNewTransaction(EMPTY_TRANSACTION_FORM);
            await getTransactions({
                page,
                perPage: 10,
                startDate: startDateQuery || undefined,
                endDate: endDateQuery || undefined,
            });
        } catch {
            // Error state is already managed in TransactionContext.
        }
    };

    const handleFilter = (event) => {
        event.preventDefault();
        setLocalError(null);

        if (startDateInput && endDateInput && startDateInput > endDateInput) {
            setLocalError("Start date cannot be after end date.");
            return;
        }

        setPage(1);
        setStartDateQuery(startDateInput);
        setEndDateQuery(endDateInput);
    };

    const clearFilters = () => {
        setStartDateInput("");
        setEndDateInput("");
        setStartDateQuery("");
        setEndDateQuery("");
        setPage(1);
        setLocalError(null);
    };

    const formatDate = (value) => {
        if (!value) return "-";
        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) return value;
        return parsed.toLocaleString();
    };

    const formatQuantity = (type, quantity) => {
        if (type === "Stock Out") {
            return `-${Math.abs(quantity)}`;
        }
        return `+${Math.abs(quantity)}`;
    };

    return (
        <Stack spacing={3}>
            <Stack spacing={0.5}>
                <Typography variant="h4">Transactions</Typography>
                <Typography color="text.secondary">
                    Record stock in and stock out activity, then filter by date range.
                </Typography>
            </Stack>

            {(localError || transactionsError) && (
                <Alert severity="error">{localError || transactionsError}</Alert>
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
                        select
                        label="Product"
                        value={newTransaction.productName}
                        onChange={(event) => {
                            setNewTransaction((current) => ({
                                ...current,
                                productName: event.target.value,
                            }));
                            setLocalError(null);
                        }}
                        disabled={transactionsIsLoading || productOptions.length === 0}
                    >
                        {productOptions.map((name) => (
                            <MenuItem key={name} value={name}>
                                {name}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        select
                        label="Type"
                        value={newTransaction.transactionType}
                        onChange={(event) => {
                            setNewTransaction((current) => ({
                                ...current,
                                transactionType: event.target.value,
                            }));
                            setLocalError(null);
                        }}
                        disabled={transactionsIsLoading}
                    >
                        {TRANSACTION_TYPES.map((type) => (
                            <MenuItem key={type} value={type}>
                                {type}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        label="Quantity"
                        type="number"
                        inputProps={{ min: 1, step: 1 }}
                        value={newTransaction.quantityChange}
                        onChange={(event) => {
                            setNewTransaction((current) => ({
                                ...current,
                                quantityChange: event.target.value,
                            }));
                            setLocalError(null);
                        }}
                        disabled={transactionsIsLoading}
                    />

                    <Button
                        type="submit"
                        variant="contained"
                        startIcon={<AddRounded />}
                        disabled={transactionsIsLoading}
                    >
                        Add transaction
                    </Button>
                </Stack>
            </Paper>

            <Paper sx={{ p: { xs: 2, md: 3 } }}>
                <Stack
                    component="form"
                    onSubmit={handleFilter}
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1.5}
                    alignItems={{ xs: "stretch", sm: "center" }}
                >
                    <TextField
                        label="Start date"
                        type="date"
                        value={startDateInput}
                        onChange={(event) => setStartDateInput(event.target.value)}
                        disabled={transactionsIsLoading}
                        InputLabelProps={{ shrink: true }}
                    />

                    <TextField
                        label="End date"
                        type="date"
                        value={endDateInput}
                        onChange={(event) => setEndDateInput(event.target.value)}
                        disabled={transactionsIsLoading}
                        InputLabelProps={{ shrink: true }}
                    />

                    <Button
                        type="submit"
                        variant="outlined"
                        startIcon={<FilterAltRounded />}
                        disabled={transactionsIsLoading}
                    >
                        Filter
                    </Button>

                    <Button
                        type="button"
                        variant="text"
                        onClick={clearFilters}
                        disabled={transactionsIsLoading}
                    >
                        Clear
                    </Button>
                </Stack>
            </Paper>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell width="8%">ID</TableCell>
                            <TableCell>Product</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Quantity</TableCell>
                            <TableCell>Date</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {transactionsIsLoading && transactions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                    <CircularProgress size={28} />
                                </TableCell>
                            </TableRow>
                        ) : transactions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                    No transactions found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            transactions.map((transaction) => (
                                <TableRow key={transaction.id} hover>
                                    <TableCell>{transaction.id}</TableCell>
                                    <TableCell>{transaction.product_name}</TableCell>
                                    <TableCell>{transaction.transaction_type}</TableCell>
                                    <TableCell>{formatQuantity(transaction.transaction_type, transaction.quantity_change)}</TableCell>
                                    <TableCell>{formatDate(transaction.created_at)}</TableCell>
                                </TableRow>
                            ))
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
                            disabled={transactionsIsLoading || page <= 1}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={() => setPage((current) => current + 1)}
                            disabled={transactionsIsLoading || page >= totalPages}
                        >
                            Next
                        </Button>
                    </Stack>
                </Stack>
            </Paper>
        </Stack>
    );
}