import { SearchRounded } from "@mui/icons-material";
import {
    Button,
    InputAdornment,
    Paper,
    Stack,
    TextField,
    Typography,
} from "@mui/material";

export default function SearchProductsForm({
    searchNameInput,
    searchSkuInput,
    onSearchNameChange,
    onSearchSkuChange,
    onSubmit,
    onClear,
    disabled,
}) {
    return (
        <Paper sx={{ p: { xs: 2, md: 2.5 }, flex: 1 }}>
            <Stack spacing={1.5}>
                <Typography variant="h6">Search products</Typography>
                <Typography variant="body2" color="text.secondary">
                    Filter products by name and SKU to quickly find items.
                </Typography>

                <Stack
                    component="form"
                    onSubmit={onSubmit}
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1.5}
                    alignItems={{ xs: "stretch", sm: "center" }}
                >
                    <TextField
                        fullWidth
                        label="Search by name"
                        value={searchNameInput}
                        onChange={(event) => onSearchNameChange(event.target.value)}
                        disabled={disabled}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchRounded fontSize="small" />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <TextField
                        fullWidth
                        label="Search by SKU"
                        value={searchSkuInput}
                        onChange={(event) => onSearchSkuChange(event.target.value)}
                        disabled={disabled}
                    />
                    <Button
                        type="submit"
                        variant="outlined"
                        startIcon={<SearchRounded />}
                        disabled={disabled}
                        sx={{ minWidth: 110 }}
                    >
                        Search
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
