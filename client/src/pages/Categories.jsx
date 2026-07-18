import { useEffect, useMemo, useState } from "react";
import {
    Alert,
    Box,
    Chip,
    Paper,
    Stack,
    Typography,
} from "@mui/material";

import { useCategoryContext } from "../contexts/CategoryContext";
import AddCategoryForm from "../components/AddCategoryForm";
import SearchCategoriesForm from "../components/SearchCategoriesForm";
import CategoriesGrid from "../components/CategoriesGrid";

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
    const totalCategories = categoryPagination?.total ?? 0;
    const isFiltered = Boolean(searchQuery);

    const pageLabel = useMemo(() => {
        const total = totalCategories;
        if (total === 0) return "No categories found";
        return `Page ${categoryPagination.page} of ${totalPages} (${total} total)`;
    }, [categoryPagination, totalCategories, totalPages]);

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
                        <Typography variant="h4">Category Management</Typography>
                        <Typography color="text.secondary">
                            Organize your inventory with clean, searchable categories.
                        </Typography>
                    </Box>
                    <Stack direction="row" spacing={1}>
                        <Chip label={`${totalCategories} total`} color="primary" variant="outlined" />
                        {isFiltered && <Chip label={`Filter: ${searchQuery}`} variant="outlined" />}
                    </Stack>
                </Stack>
            </Paper>

            {(localError || categoriesError) && (
                <Alert severity="error">{localError || categoriesError}</Alert>
            )}

            <Stack direction={{ xs: "column", lg: "row" }} spacing={2.5}>
                <AddCategoryForm
                    value={newCategoryName}
                    onChange={(event) => {
                        setNewCategoryName(event.target.value);
                        setLocalError(null);
                    }}
                    onSubmit={handleCreate}
                    disabled={categoriesIsLoading}
                />

                <SearchCategoriesForm
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    onSubmit={handleSearch}
                    onClear={() => {
                        setSearchInput("");
                        setSearchQuery("");
                        setPage(1);
                    }}
                    disabled={categoriesIsLoading}
                />
            </Stack>

            <CategoriesGrid
                categories={categories}
                categoriesIsLoading={categoriesIsLoading}
                editingId={editingId}
                editingName={editingName}
                onEditingNameChange={(value) => {
                    setEditingName(value);
                    setLocalError(null);
                }}
                onStartEdit={startEdit}
                onCancelEdit={cancelEdit}
                onSaveEdit={saveEdit}
                onDelete={handleDelete}
                page={page}
                pageLabel={pageLabel}
                totalPages={totalPages}
                totalCategories={totalCategories}
                onPageChange={(nextPage) => setPage(nextPage)}
            />
        </Stack>
    );
}