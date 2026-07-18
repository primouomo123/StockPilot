import { FilterAltRounded } from "@mui/icons-material";
import { Button, Paper, Stack, TextField, Typography } from "@mui/material";

export default function FilterTransactionsForm({
    startDateInput,
    endDateInput,
    onStartDateChange,
    onEndDateChange,
    onSubmit,
    onClear,
    disabled,
}) {
    return (
        <Paper sx={{ p: { xs: 2, md: 2.5 } }}>
            <Stack spacing={1.5}>
                <Typography variant="h6">Filter transactions</Typography>
                <Typography variant="body2" color="text.secondary">
                    Narrow transaction history by start and end date.
                </Typography>

                <Stack
                    component="form"
                    onSubmit={onSubmit}
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1.5}
                    alignItems={{ xs: "stretch", sm: "flex-end" }}
                >
                    <Stack spacing={0.5} sx={{ flex: 1, minWidth: { sm: 220 } }}>
                        <Typography variant="body2" color="text.secondary">
                            Start date
                        </Typography>
                        <TextField
                            type="date"
                            value={startDateInput}
                            onChange={(event) => onStartDateChange(event.target.value)}
                            disabled={disabled}
                            fullWidth
                        />
                    </Stack>

                    <Stack spacing={0.5} sx={{ flex: 1, minWidth: { sm: 220 } }}>
                        <Typography variant="body2" color="text.secondary">
                            End date
                        </Typography>
                        <TextField
                            type="date"
                            value={endDateInput}
                            onChange={(event) => onEndDateChange(event.target.value)}
                            disabled={disabled}
                            fullWidth
                        />
                    </Stack>

                    <Button
                        type="submit"
                        variant="outlined"
                        startIcon={<FilterAltRounded />}
                        disabled={disabled}
                        sx={{ minWidth: 110 }}
                    >
                        Filter
                    </Button>

                    <Button
                        type="button"
                        variant="text"
                        onClick={onClear}
                        disabled={disabled}
                    >
                        Clear
                    </Button>
                </Stack>
            </Stack>
        </Paper>
    );
}
