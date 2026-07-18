import {
    Button,
    Chip,
    CircularProgress,
    LinearProgress,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";

export default function TransactionsGrid({
    transactions,
    transactionsIsLoading,
    formatQuantity,
    formatDate,
    pageLabel,
    page,
    totalPages,
    onPrevPage,
    onNextPage,
}) {
    return (
        <>
            <Paper sx={{ overflow: "hidden" }}>
                {transactionsIsLoading && <LinearProgress />}
                <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow
                            sx={{
                                "& .MuiTableCell-root": {
                                    bgcolor: "grey.100",
                                    fontWeight: 700,
                                    letterSpacing: "0.02em",
                                },
                            }}
                        >
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
                                <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                                    <CircularProgress size={28} />
                                </TableCell>
                            </TableRow>
                        ) : transactions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                                    <Stack spacing={0.75} alignItems="center">
                                        <Typography variant="subtitle1">No transactions found</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Add a transaction or adjust your date filters.
                                        </Typography>
                                    </Stack>
                                </TableCell>
                            </TableRow>
                        ) : (
                            transactions.map((transaction) => (
                                <TableRow
                                    key={transaction.id}
                                    hover
                                    sx={{
                                        "&:nth-of-type(even)": {
                                            backgroundColor: "rgba(0, 0, 0, 0.01)",
                                        },
                                    }}
                                >
                                    <TableCell>{transaction.id}</TableCell>
                                    <TableCell>{transaction.product_name}</TableCell>
                                    <TableCell>
                                        <Chip
                                            size="small"
                                            label={transaction.transaction_type}
                                            color={
                                                transaction.transaction_type === "Stock Out"
                                                    ? "warning"
                                                    : "success"
                                            }
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography
                                            fontWeight={600}
                                            color={
                                                transaction.transaction_type === "Stock Out"
                                                    ? "warning.main"
                                                    : "success.main"
                                            }
                                        >
                                            {formatQuantity(
                                                transaction.transaction_type,
                                                transaction.quantity_change
                                            )}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>{formatDate(transaction.created_at)}</TableCell>
                                </TableRow>
                            ))
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
                            disabled={transactionsIsLoading || page <= 1}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={onNextPage}
                            disabled={transactionsIsLoading || page >= totalPages}
                        >
                            Next
                        </Button>
                    </Stack>
                </Stack>
            </Paper>
        </>
    );
}
