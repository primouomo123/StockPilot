


import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Alert,
    Box,
    Button,
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

        const payload = {
            username,
            email,
        };

        if (password) {
            payload.password = password;
        }

        try {
            await updateMe(payload);
            setFormData((current) => ({
                ...current,
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
            <Stack spacing={0.5}>
                <Typography variant="h4">My Account</Typography>
                <Typography color="text.secondary">
                    Update your profile details and optionally change your password.
                </Typography>
            </Stack>

            {(localError || authError) && (
                <Alert severity="error">{localError || authError}</Alert>
            )}

            {successMessage && (
                <Alert severity="success">{successMessage}</Alert>
            )}

            <Paper sx={{ p: { xs: 2, md: 3 } }}>
                <Stack component="form" spacing={2} onSubmit={handleSubmit} noValidate>
                    <TextField
                        label="Username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        autoComplete="username"
                        disabled={authIsLoading}
                        required
                    />

                    <TextField
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        autoComplete="email"
                        disabled={authIsLoading}
                        required
                    />

                    <TextField
                        label="New password (optional)"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        autoComplete="new-password"
                        disabled={authIsLoading}
                    />

                    <TextField
                        label="Confirm new password"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        autoComplete="new-password"
                        disabled={authIsLoading}
                    />

                    <Typography variant="body2" color="text.secondary">
                        Account created: {accountCreatedAt}
                    </Typography>

                    <Stack direction="row" spacing={1.5}>
                        <Button type="submit" variant="contained" disabled={authIsLoading}>
                            {authIsLoading ? "Saving..." : "Save changes"}
                        </Button>
                    </Stack>
                </Stack>
            </Paper>

            <Paper sx={{ p: { xs: 2, md: 3 }, border: 1, borderColor: "error.main" }}>
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