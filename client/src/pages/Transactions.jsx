


import { useEffect, useMemo, useState } from "react";
import {
    Alert,
    Box,
    Chip,
    Paper,
    Stack,
    Typography,
} from "@mui/material";

import { useProductContext } from "../contexts/ProductContext";
import { useTransactionContext } from "../contexts/TransactionContext";
import AddTransactionForm from "../components/AddTransactionForm";
import FilterTransactionsForm from "../components/FilterTransactionsForm";
import TransactionsGrid from "../components/TransactionsGrid";

const TRANSACTION_TYPES = ["Stock In", "Stock Out"];

const EMPTY_TRANSACTION_FORM = {
    productName: "",
    transactionType: "Stock In",
    quantityChange: "",
};

function formatCount(value) {
    const number = Number(value ?? 0);
    if (Number.isNaN(number)) return value;
    return number.toLocaleString();
}

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
    const totalTransactions = transactionPagination?.total ?? 0;
    const hasDateFilter = Boolean(startDateQuery || endDateQuery);

    const pageLabel = useMemo(() => {
        const total = totalTransactions;
        if (total === 0) return "No transactions found";
        return `Page ${transactionPagination.page} of ${totalPages} (${formatCount(total)} total)`;
    }, [transactionPagination, totalPages, totalTransactions]);

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
        const formattedQuantity = formatCount(Math.abs(quantity));
        if (type === "Stock Out") {
            return `-${formattedQuantity}`;
        }
        return `+${formattedQuantity}`;
    };

    return (
        <Stack spacing={3}>
            <Paper
                elevation={0}
                sx={{
                    p: { xs: 2, md: 3 },
                    border: 1,
                    borderColor: "divider",
                    backgroundColor: (theme) =>
                        theme.palette.mode === "dark" ? "rgba(2,136,209,0.18)" : "rgba(2,136,209,0.10)",
                }}
            >
                <Stack
                    direction={{ xs: "column", md: "row" }}
                    spacing={1.5}
                    alignItems={{ xs: "flex-start", md: "center" }}
                    justifyContent="space-between"
                >
                    <Box>
                        <Typography variant="h4">Transaction Activity</Typography>
                        <Typography color="text.secondary">
                            Record stock in and stock out activity, then filter by date range.
                        </Typography>
                    </Box>
                    <Stack direction="row" spacing={1}>
                        <Chip label={`${formatCount(totalTransactions)} total`} color="primary" variant="outlined" />
                        {hasDateFilter && (
                            <Chip
                                label={
                                    startDateQuery && endDateQuery
                                        ? `${startDateQuery} to ${endDateQuery}`
                                        : startDateQuery
                                          ? `From ${startDateQuery}`
                                          : `Through ${endDateQuery}`
                                }
                                variant="outlined"
                            />
                        )}
                    </Stack>
                </Stack>
            </Paper>

            {(localError || transactionsError) && (
                <Alert severity="error">{localError || transactionsError}</Alert>
            )}

            <AddTransactionForm
                transaction={newTransaction}
                transactionTypes={TRANSACTION_TYPES}
                productOptions={productOptions}
                onFieldChange={(field, value) => {
                    setNewTransaction((current) => ({
                        ...current,
                        [field]: value,
                    }));
                    setLocalError(null);
                }}
                onSubmit={handleCreate}
                disabled={transactionsIsLoading}
            />

            <FilterTransactionsForm
                startDateInput={startDateInput}
                endDateInput={endDateInput}
                onStartDateChange={(value) => setStartDateInput(value)}
                onEndDateChange={(value) => setEndDateInput(value)}
                onSubmit={handleFilter}
                onClear={clearFilters}
                disabled={transactionsIsLoading}
            />

            <TransactionsGrid
                transactions={transactions}
                transactionsIsLoading={transactionsIsLoading}
                formatQuantity={formatQuantity}
                formatDate={formatDate}
                pageLabel={pageLabel}
                page={page}
                totalPages={totalPages}
                onPrevPage={() => setPage((current) => Math.max(1, current - 1))}
                onNextPage={() => setPage((current) => current + 1)}
            />
        </Stack>
    );
}