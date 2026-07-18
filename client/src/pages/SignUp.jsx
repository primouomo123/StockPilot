


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

export default function SignUp() {
    const navigate = useNavigate();
    const { signUp, authError, authIsLoading, setAuthError } = useUserContext();
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
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
        const email = formData.email.trim();
        const password = formData.password;
        const confirmPassword = formData.confirmPassword;

        if (!username || !email || !password || !confirmPassword) {
            setLocalError("All fields are required.");
            return;
        }

        if (password !== confirmPassword) {
            setLocalError("Passwords do not match.");
            return;
        }

        try {
            await signUp(username, email, password);
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
                background: "linear-gradient(180deg, rgba(37,99,235,0.10) 0%, rgba(245,247,251,1) 45%)",
                py: 4,
            }}
        >
            <Container maxWidth="sm">
                <Paper elevation={0} sx={{ p: { xs: 3, sm: 4 }, border: 1, borderColor: "divider" }}>
                    <Stack spacing={3} component="form" onSubmit={handleSubmit} noValidate>
                        <Stack spacing={1}>
                            <Typography variant="h4">Create your account</Typography>
                            <Typography color="text.secondary">
                                Sign up to start tracking categories, inventory, and transactions.
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
                            label="Password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            autoComplete="new-password"
                            disabled={authIsLoading}
                            required
                        />

                        <TextField
                            label="Confirm password"
                            name="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            autoComplete="new-password"
                            disabled={authIsLoading}
                            required
                        />

                        <Button type="submit" variant="contained" size="large" disabled={authIsLoading}>
                            {authIsLoading ? "Creating account..." : "Sign up"}
                        </Button>

                        <Typography color="text.secondary">
                            Already have an account?{" "}
                            <Link component={RouterLink} to="/login" underline="hover">
                                Log in
                            </Link>
                        </Typography>
                    </Stack>
                </Paper>
            </Container>
        </Box>
    );
}