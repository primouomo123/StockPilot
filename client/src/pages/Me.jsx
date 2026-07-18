


import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Paper,
    Stack,
    TextField,
    Typography,
} from "@mui/material";

import { useUserContext } from "../contexts/UserContext";

export default function Me() {
    const navigate = useNavigate();
    const {
        currentUser,
        authIsLoading,
        authError,
        updateMe,
        deleteMe,
        loadCurrentUser,
        setAuthError,
    } = useUserContext();

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        currentPassword: "",
        password: "",
        confirmPassword: "",
    });
    const [localError, setLocalError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    useEffect(() => {
        if (currentUser) {
            setFormData((current) => ({
                ...current,
                username: currentUser.username ?? "",
                email: currentUser.email ?? "",
            }));
            return;
        }

        loadCurrentUser().catch(() => {
            // Error state is already handled in UserContext.
        });
    }, [currentUser, loadCurrentUser]);

    useEffect(() => {
        setAuthError(null);
        return () => setAuthError(null);
    }, [setAuthError]);

    const accountCreatedAt = useMemo(() => {
        if (!currentUser?.created_at) return "-";
        const parsed = new Date(currentUser.created_at);
        if (Number.isNaN(parsed.getTime())) return currentUser.created_at;
        return parsed.toLocaleString();
    }, [currentUser]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((current) => ({
            ...current,
            [name]: value,
        }));
        setLocalError(null);
        setSuccessMessage(null);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLocalError(null);
        setSuccessMessage(null);

        const username = formData.username.trim();
        const email = formData.email.trim();
        const currentPassword = formData.currentPassword;
        const password = formData.password;
        const confirmPassword = formData.confirmPassword;

        if (!username || !email) {
            setLocalError("Username and email are required.");
            return;
        }

        if ((password || confirmPassword) && password !== confirmPassword) {
            setLocalError("Passwords do not match.");
            return;
        }

        const hasProfileChanges =
            username !== (currentUser?.username ?? "") ||
            email !== (currentUser?.email ?? "") ||
            Boolean(password);

        if (!hasProfileChanges) {
            setLocalError("No profile changes to save.");
            return;
        }

        if (!currentPassword) {
            setLocalError("Current password is required to save profile changes.");
            return;
        }

        const payload = {
            username,
            email,
            current_password: currentPassword,
        };

        if (password) {
            payload.password = password;
        }

        try {
            await updateMe(payload);
            setFormData((current) => ({
                ...current,
                currentPassword: "",
                password: "",
                confirmPassword: "",
            }));
            setSuccessMessage("Profile updated successfully.");
        } catch {
            // Error state is already handled in UserContext.
        }
    };

    const handleDeleteAccount = async () => {
        const confirmed = window.confirm(
            "Delete your account permanently? This action cannot be undone."
        );

        if (!confirmed) return;

        try {
            await deleteMe();
            navigate("/login", { replace: true });
        } catch {
            // Error state is already handled in UserContext.
        }
    };

    if (authIsLoading && !currentUser) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                <CircularProgress size={30} />
            </Box>
        );
    }

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
                        <Typography variant="h4">My Account</Typography>
                        <Typography color="text.secondary">
                            Manage profile details and password security settings.
                        </Typography>
                    </Box>
                    <Stack direction="row" spacing={1}>
                        {currentUser?.username && (
                            <Chip label={`@${currentUser.username}`} variant="outlined" color="primary" />
                        )}
                        <Chip label="Security required" variant="outlined" />
                    </Stack>
                </Stack>
            </Paper>

            {(localError || authError) && (
                <Alert severity="error">{localError || authError}</Alert>
            )}

            {successMessage && (
                <Alert severity="success">{successMessage}</Alert>
            )}

            <Paper sx={{ p: { xs: 2, md: 3 } }}>
                <Stack component="form" spacing={2} onSubmit={handleSubmit} noValidate>
                    <Stack spacing={1}>
                        <Typography variant="h6">Profile details</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Update your public account information.
                        </Typography>
                    </Stack>

                    <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
                        <TextField
                            fullWidth
                            label="Username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            autoComplete="username"
                            disabled={authIsLoading}
                            required
                        />

                        <TextField
                            fullWidth
                            label="Email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            autoComplete="email"
                            disabled={authIsLoading}
                            required
                        />
                    </Stack>

                    <Stack spacing={1} sx={{ pt: 1 }}>
                        <Typography variant="h6">Security</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Enter your current password to confirm any profile update.
                        </Typography>
                    </Stack>

                    <TextField
                        label="Current password"
                        name="currentPassword"
                        type="password"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        autoComplete="current-password"
                        disabled={authIsLoading}
                        required
                    />

                    <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
                        <TextField
                            fullWidth
                            label="New password (optional)"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            autoComplete="new-password"
                            disabled={authIsLoading}
                        />

                        <TextField
                            fullWidth
                            label="Confirm new password"
                            name="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            autoComplete="new-password"
                            disabled={authIsLoading}
                        />
                    </Stack>

                    <Typography variant="body2" color="text.secondary">
                        Account created: {accountCreatedAt}
                    </Typography>

                    <Stack direction="row" spacing={1.5} justifyContent="flex-end">
                        <Button type="submit" variant="contained" disabled={authIsLoading}>
                            {authIsLoading ? "Saving..." : "Save changes"}
                        </Button>
                    </Stack>
                </Stack>
            </Paper>

            <Paper
                sx={{
                    p: { xs: 2, md: 3 },
                    border: 1,
                    borderColor: "error.main",
                    backgroundColor: "rgba(211,47,47,0.03)",
                }}
            >
                <Stack spacing={1.5}>
                    <Typography variant="h6" color="error.main">
                        Danger zone
                    </Typography>
                    <Typography color="text.secondary">
                        Deleting your account removes your access permanently. You cannot undo this action.
                    </Typography>
                    <Button
                        variant="outlined"
                        color="error"
                        onClick={handleDeleteAccount}
                        disabled={authIsLoading}
                    >
                        Delete account
                    </Button>
                </Stack>
            </Paper>
        </Stack>
    );
}