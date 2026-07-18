import {
    Avatar,
    Box,
    CircularProgress,
    Divider,
    IconButton,
    LinearProgress,
    Pagination,
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
    DeleteRounded,
    EditRounded,
    SaveRounded,
    CloseRounded,
} from "@mui/icons-material";

export default function CategoriesGrid({
    categories,
    categoriesIsLoading,
    editingId,
    editingName,
    onEditingNameChange,
    onStartEdit,
    onCancelEdit,
    onSaveEdit,
    onDelete,
    page,
    pageLabel,
    totalPages,
    totalCategories,
    onPageChange,
}) {
    const actionsColumnWidth = 160;

    return (
        <Paper sx={{ overflow: "hidden" }}>
            {categoriesIsLoading && <LinearProgress />}

            <TableContainer>
                <Table
                    sx={{
                        tableLayout: "fixed",
                        "& .MuiTableCell-root": {
                            verticalAlign: "middle",
                        },
                    }}
                >
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
                            <TableCell width="12%" align="center">ID</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell sx={{ width: actionsColumnWidth }} align="center">
                                <Box sx={{ position: "relative", left: -24 }}>Actions</Box>
                            </TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {categoriesIsLoading && categories.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} align="center" sx={{ py: 5 }}>
                                    <CircularProgress size={28} />
                                </TableCell>
                            </TableRow>
                        ) : categories.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} align="center" sx={{ py: 6 }}>
                                    <Stack spacing={0.75} alignItems="center">
                                        <Typography variant="subtitle1">No categories found</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Add a category or adjust your search terms.
                                        </Typography>
                                    </Stack>
                                </TableCell>
                            </TableRow>
                        ) : (
                            categories.map((category) => {
                                const isEditing = editingId === category.id;

                                return (
                                    <TableRow
                                        key={category.id}
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
                                        <TableCell align="center">
                                            <Typography variant="body2" color="text.secondary">
                                                #{category.id}
                                            </Typography>
                                        </TableCell>

                                        <TableCell sx={{ overflow: "hidden" }}>
                                            {isEditing ? (
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    value={editingName}
                                                    onChange={(event) => onEditingNameChange(event.target.value)}
                                                    disabled={categoriesIsLoading}
                                                />
                                            ) : (
                                                <Stack
                                                    direction="row"
                                                    spacing={1.25}
                                                    alignItems="center"
                                                >
                                                    <Avatar
                                                        sx={{
                                                            width: 30,
                                                            height: 30,
                                                            fontSize: 13,
                                                            bgcolor: "primary.light",
                                                            color: "primary.contrastText",
                                                        }}
                                                    >
                                                        {category.name.slice(0, 1).toUpperCase()}
                                                    </Avatar>
                                                        <Typography
                                                            fontWeight={500}
                                                            noWrap
                                                            sx={{ textOverflow: "ellipsis", overflow: "hidden" }}
                                                        >
                                                            {category.name}
                                                        </Typography>
                                                </Stack>
                                            )}
                                        </TableCell>

                                        <TableCell align="center" sx={{ width: actionsColumnWidth }}>
                                            {isEditing ? (
                                                <Stack direction="row" spacing={0.5} justifyContent="center">
                                                    <Tooltip title="Save">
                                                        <span>
                                                            <IconButton
                                                                color="primary"
                                                                onClick={() => onSaveEdit(category.id)}
                                                                disabled={categoriesIsLoading}
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
                                                                disabled={categoriesIsLoading}
                                                            >
                                                                <CloseRounded />
                                                            </IconButton>
                                                        </span>
                                                    </Tooltip>
                                                </Stack>
                                            ) : (
                                                <Stack direction="row" spacing={0.5} justifyContent="center">
                                                    <Tooltip title="Edit category">
                                                        <span>
                                                            <IconButton
                                                                color="primary"
                                                                onClick={() => onStartEdit(category)}
                                                                disabled={categoriesIsLoading}
                                                            >
                                                                <EditRounded />
                                                            </IconButton>
                                                        </span>
                                                    </Tooltip>
                                                    <Tooltip title="Delete category">
                                                        <span>
                                                            <IconButton
                                                                color="error"
                                                                onClick={() => onDelete(category.id, category.name)}
                                                                disabled={categoriesIsLoading}
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

            <Divider />

            <Box sx={{ p: 2 }}>
                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    alignItems={{ xs: "flex-start", sm: "center" }}
                    justifyContent="space-between"
                    spacing={1.5}
                >
                    <Typography color="text.secondary">{pageLabel}</Typography>
                    <Pagination
                        shape="rounded"
                        color="primary"
                        page={page}
                        count={Math.max(1, totalPages)}
                        onChange={(_, nextPage) => onPageChange(nextPage)}
                        disabled={categoriesIsLoading || totalCategories === 0}
                    />
                </Stack>
            </Box>
        </Paper>
    );
}
