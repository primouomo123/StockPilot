import { SearchRounded } from "@mui/icons-material";
import {
    Button,
    InputAdornment,
    Paper,
    Stack,
    TextField,
    Typography,
} from "@mui/material";

export default function SearchCategoriesForm({
    value,
    onChange,
    onSubmit,
    onClear,
    disabled,
}) {
    return (
        <Paper sx={{ p: { xs: 2, md: 2.5 }, flex: 1 }}>
            <Stack spacing={1.5}>
                <Typography variant="h6">Search categories</Typography>
                <Typography variant="body2" color="text.secondary">
                    Quickly find and refine categories by name.
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
                        value={value}
                        onChange={onChange}
                        disabled={disabled}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchRounded fontSize="small" />
                                </InputAdornment>
                            ),
                        }}
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
