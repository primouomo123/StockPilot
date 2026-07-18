import {
    AppBar,
    Box,
    Button,
    IconButton,
    Stack,
    Toolbar,
    Typography,
} from "@mui/material";
import {
    AccountCircleRounded,
    DarkModeRounded,
    Inventory2Rounded,
    LightModeRounded,
    LogoutRounded,
} from "@mui/icons-material";
import { Link as RouterLink, useLocation } from "react-router-dom";

import { useThemeContext } from "../contexts/ThemeContext";
import { useUserContext } from "../contexts/UserContext";

const NAV_ITEMS = [
    { to: "/", label: "Dashboard" },
    { to: "/categories", label: "Categories" },
    { to: "/inventory", label: "Inventory" },
    { to: "/transactions", label: "Transactions" },
    { to: "/me", label: "Profile" },
];

function isRouteActive(pathname, targetPath) {
    if (targetPath === "/") {
        return pathname === "/";
    }

    return pathname === targetPath || pathname.startsWith(`${targetPath}/`);
}

export default function Header({ onLogout }) {
    const location = useLocation();
    const { isDarkMode, toggleTheme } = useThemeContext();
    const { currentUser, authIsLoading } = useUserContext();

    const displayName =
        currentUser?.username || currentUser?.email || "User";

    return (
        <AppBar
            position="sticky"
            elevation={0}
            color="transparent"
            sx={{
                bgcolor: "background.paper",
                borderBottom: 1,
                borderColor: "divider",
                mb: 4,
            }}
        >
            <Toolbar
                sx={{
                    minHeight: 80,
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 3,
                    flexWrap: "wrap",
                }}
            >
                {/* Logo */}
                <Stack
                    direction="row"
                    spacing={1.5}
                    alignItems="center"
                >
                    <Inventory2Rounded
                        color="primary"
                        sx={{ fontSize: 36 }}
                    />

                    <Box>
                        <Typography
                            variant="h6"
                            fontWeight={700}
                        >
                            StockPilot
                        </Typography>

                        <Typography
                            variant="caption"
                            color="text.secondary"
                        >
                            Inventory Management System
                        </Typography>
                    </Box>
                </Stack>

                {/* Navigation */}
                <Stack
                    direction="row"
                    spacing={1}
                    flexWrap="wrap"
                    useFlexGap
                >
                    {NAV_ITEMS.map((item) => {
                        const active = isRouteActive(
                            location.pathname,
                            item.to
                        );

                        return (
                            <Button
                                key={item.to}
                                component={RouterLink}
                                to={item.to}
                                color={active ? "primary" : "inherit"}
                                sx={{
                                    px: 2,
                                    borderRadius: 2,
                                    fontWeight: active ? 700 : 500,
                                    borderBottom: active
                                        ? 2
                                        : 2,
                                    borderColor: active
                                        ? "primary.main"
                                        : "transparent",
                                }}
                            >
                                {item.label}
                            </Button>
                        );
                    })}
                </Stack>

                {/* Right Side */}
                <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                >
                    <IconButton
                        onClick={toggleTheme}
                        color="inherit"
                    >
                        {isDarkMode ? (
                            <LightModeRounded />
                        ) : (
                            <DarkModeRounded />
                        )}
                    </IconButton>

                    <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                    >
                        <AccountCircleRounded color="action" />

                        <Box>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                display="block"
                            >
                                Welcome back
                            </Typography>

                            <Typography
                                fontWeight={600}
                                lineHeight={1.2}
                            >
                                {displayName}
                            </Typography>
                        </Box>
                    </Stack>

                    <Button
                        color="error"
                        variant="outlined"
                        startIcon={<LogoutRounded />}
                        onClick={onLogout}
                        disabled={authIsLoading}
                    >
                        {authIsLoading
                            ? "Signing out..."
                            : "Logout"}
                    </Button>
                </Stack>
            </Toolbar>
        </AppBar>
    );
}