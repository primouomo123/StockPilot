


import { useEffect, useMemo, useState } from "react";
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    IconButton,
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
    DeleteRounded,
    EditRounded,
    SaveRounded,
    SearchRounded,
    CloseRounded,
} from "@mui/icons-material";

import { useCategoryContext } from "../contexts/CategoryContext";

export default function Categories() {
    const {
        categories,
        categoryPagination,
        categoriesIsLoading,
        categoriesError,
        getCategories,
        createCategory,
        updateCategory,
        deleteCategory,
    } = useCategoryContext();

    const [newCategoryName, setNewCategoryName] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(1);
    const [localError, setLocalError] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editingName, setEditingName] = useState("");

    useEffect(() => {
        getCategories({
            page,
            perPage: 10,
            name: searchQuery || undefined,
        }).catch(() => {
            // Error message is already managed in context.
        });
    }, [getCategories, page, searchQuery]);

    const totalPages = categoryPagination?.totalPages || 1;

    const pageLabel = useMemo(() => {
        const total = categoryPagination?.total ?? 0;
        if (total === 0) return "No categories found";
        return `Page ${categoryPagination.page} of ${totalPages} (${total} total)`;
    }, [categoryPagination, totalPages]);

    const handleCreate = async (event) => {
        event.preventDefault();
        setLocalError(null);

        const name = newCategoryName.trim();
        if (!name) {
            setLocalError("Category name is required.");
            return;
        }

        try {
            await createCategory({ name });
            setNewCategoryName("");
            await getCategories({
                page,
                perPage: 10,
                name: searchQuery || undefined,
            });
        } catch {
            // Error message is already managed in context.
        }
    };

    const handleSearch = (event) => {
        event.preventDefault();
        setPage(1);
        setSearchQuery(searchInput.trim());
    };

    const startEdit = (category) => {
        setEditingId(category.id);
        setEditingName(category.name);
        setLocalError(null);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditingName("");
    };

    const saveEdit = async (categoryId) => {
        const name = editingName.trim();
        if (!name) {
            setLocalError("Category name is required.");
            return;
        }

        try {
            await updateCategory(categoryId, { name });
            cancelEdit();
        } catch {
            // Error message is already managed in context.
        }
    };

    const handleDelete = async (categoryId, categoryName) => {
        const confirmed = window.confirm(
            `Delete category \"${categoryName}\"? This cannot be undone.`
        );
        if (!confirmed) return;

        try {
            await deleteCategory(categoryId);

            const nextPage =
                categories.length === 1 && page > 1 ? page - 1 : page;
            if (nextPage !== page) {
                setPage(nextPage);
            } else {
                await getCategories({
                    page,
                    perPage: 10,
                    name: searchQuery || undefined,
                });
            }
        } catch {
            // Error message is already managed in context.
        }
    };

    return (
        <Stack spacing={3}>
            <Stack spacing={0.5}>
                <Typography variant="h4">Categories</Typography>
                <Typography color="text.secondary">
                    Create, update, and manage product categories.
                </Typography>
            </Stack>

            {(localError || categoriesError) && (
                <Alert severity="error">{localError || categoriesError}</Alert>
            )}

            <Paper sx={{ p: { xs: 2, md: 3 } }}>
                <Stack
                    component="form"
                    onSubmit={handleCreate}
                    direction={{ xs: "column", md: "row" }}
                    spacing={1.5}
                >
                    <TextField
                        label="New category name"
                        value={newCategoryName}
                        onChange={(event) => {
                            setNewCategoryName(event.target.value);
                            setLocalError(null);
                        }}
                        disabled={categoriesIsLoading}
                    />

                    <Button
                        type="submit"
                        variant="contained"
                        disabled={categoriesIsLoading}
                    >
                        Add category
                    </Button>
                </Stack>
            </Paper>

            <Paper sx={{ p: { xs: 2, md: 3 } }}>
                <Stack
                    component="form"
                    onSubmit={handleSearch}
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1.5}
                    alignItems={{ xs: "stretch", sm: "center" }}
                >
                    <TextField
                        label="Search by category name"
                        value={searchInput}
                        onChange={(event) => setSearchInput(event.target.value)}
                        disabled={categoriesIsLoading}
                    />

                    <Button
                        type="submit"
                        variant="outlined"
                        startIcon={<SearchRounded />}
                        disabled={categoriesIsLoading}
                    >
                        Search
                    </Button>

                    <Button
                        type="button"
                        variant="text"
                        onClick={() => {
                            setSearchInput("");
                            setSearchQuery("");
                            setPage(1);
                        }}
                        disabled={categoriesIsLoading}
                    >
                        Clear
                    </Button>
                </Stack>
            </Paper>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell width="12%">ID</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell width="24%" align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {categoriesIsLoading && categories.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                                    <CircularProgress size={28} />
                                </TableCell>
                            </TableRow>
                        ) : categories.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                                    No categories found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            categories.map((category) => {
                                const isEditing = editingId === category.id;

                                return (
                                    <TableRow key={category.id} hover>
                                        <TableCell>{category.id}</TableCell>

                                        <TableCell>
                                            {isEditing ? (
                                                <TextField
                                                    size="small"
                                                    value={editingName}
                                                    onChange={(event) => {
                                                        setEditingName(event.target.value);
                                                        setLocalError(null);
                                                    }}
                                                    disabled={categoriesIsLoading}
                                                />
                                            ) : (
                                                category.name
                                            )}
                                        </TableCell>

                                        <TableCell align="right">
                                            {isEditing ? (
                                                <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                                    <IconButton
                                                        color="primary"
                                                        onClick={() => saveEdit(category.id)}
                                                        disabled={categoriesIsLoading}
                                                    >
                                                        <SaveRounded />
                                                    </IconButton>
                                                    <IconButton
                                                        color="inherit"
                                                        onClick={cancelEdit}
                                                        disabled={categoriesIsLoading}
                                                    >
                                                        <CloseRounded />
                                                    </IconButton>
                                                </Stack>
                                            ) : (
                                                <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                                    <IconButton
                                                        color="primary"
                                                        onClick={() => startEdit(category)}
                                                        disabled={categoriesIsLoading}
                                                    >
                                                        <EditRounded />
                                                    </IconButton>
                                                    <IconButton
                                                        color="error"
                                                        onClick={() =>
                                                            handleDelete(category.id, category.name)
                                                        }
                                                        disabled={categoriesIsLoading}
                                                    >
                                                        <DeleteRounded />
                                                    </IconButton>
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

            <Paper sx={{ p: 2 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                    <Typography color="text.secondary">{pageLabel}</Typography>

                    <Stack direction="row" spacing={1}>
                        <Button
                            variant="outlined"
                            onClick={() => setPage((current) => Math.max(1, current - 1))}
                            disabled={categoriesIsLoading || page <= 1}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={() => setPage((current) => current + 1)}
                            disabled={categoriesIsLoading || page >= totalPages}
                        >
                            Next
                        </Button>
                    </Stack>
                </Stack>
            </Paper>
        </Stack>
    );
}