import { Button, Paper, Stack, TextField, Typography } from "@mui/material";

export default function AddCategoryForm({
    value,
    onChange,
    onSubmit,
    disabled,
}) {
    return (
        <Paper sx={{ p: { xs: 2, md: 2.5 }, flex: 1 }}>
            <Stack spacing={1.5}>
                <Typography variant="h6">Add category</Typography>
                <Typography variant="body2" color="text.secondary">
                    Create a new category for grouping related products.
                </Typography>
                <Stack
                    component="form"
                    onSubmit={onSubmit}
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1.5}
                >
                    <TextField
                        fullWidth
                        label="New category name"
                        value={value}
                        onChange={onChange}
                        disabled={disabled}
                    />

                    <Button
                        type="submit"
                        variant="contained"
                        disabled={disabled}
                        sx={{ minWidth: 140 }}
                    >
                        Add category
                    </Button>
                </Stack>
            </Stack>
        </Paper>
    );
}
