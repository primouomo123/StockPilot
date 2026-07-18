


import { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
    Alert,
    Box,
    Button,
    Container,
    Link,
    Paper,
    Stack,
    TextField,
    Typography,
} from "@mui/material";

import { useUserContext } from "../contexts/UserContext";

export default function Login() {
    const navigate = useNavigate();
    const { login, authError, authIsLoading, setAuthError } = useUserContext();
    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });
    const [localError, setLocalError] = useState(null);

    useEffect(() => {
        setAuthError(null);
        return () => setAuthError(null);
    }, [setAuthError]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((current) => ({
            ...current,
            [name]: value,
        }));
        setLocalError(null);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLocalError(null);

        const username = formData.username.trim();
        const password = formData.password;

        if (!username || !password) {
            setLocalError("Username and password are required.");
            return;
        }

        try {
            await login(username, password);
            navigate("/", { replace: true });
        } catch {
            // Error state is already handled in UserContext.
        }
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                background: "linear-gradient(180deg, rgba(5,150,105,0.12) 0%, rgba(245,247,251,1) 45%)",
                py: 4,
            }}
        >
            <Container maxWidth="sm">
                <Paper elevation={0} sx={{ p: { xs: 3, sm: 4 }, border: 1, borderColor: "divider" }}>
                    <Stack spacing={3} component="form" onSubmit={handleSubmit} noValidate>
                        <Stack spacing={1}>
                            <Typography variant="h4">Welcome back</Typography>
                            <Typography color="text.secondary">
                                Log in to manage your stock, categories, and transactions.
                            </Typography>
                        </Stack>

                        {(localError || authError) && (
                            <Alert severity="error">{localError || authError}</Alert>
                        )}

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
                            label="Password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            autoComplete="current-password"
                            disabled={authIsLoading}
                            required
                        />

                        <Button type="submit" variant="contained" size="large" disabled={authIsLoading}>
                            {authIsLoading ? "Logging in..." : "Log in"}
                        </Button>

                        <Typography color="text.secondary">
                            Need an account?{" "}
                            <Link component={RouterLink} to="/signup" underline="hover">
                                Sign up
                            </Link>
                        </Typography>
                    </Stack>
                </Paper>
            </Container>
        </Box>
    );
}