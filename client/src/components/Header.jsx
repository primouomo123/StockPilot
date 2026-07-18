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
                    minHeight: { xs: 74, md: 80 },
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 2,
                    flexWrap: "wrap",
                    py: 1,
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
                    spacing={0.75}
                    flexWrap="wrap"
                    useFlexGap
                    sx={{
                        p: 0.5,
                        borderRadius: 2.5,
                        bgcolor: "action.hover",
                        border: 1,
                        borderColor: "divider",
                    }}
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
                                    px: 1.5,
                                    py: 0.65,
                                    borderRadius: 2,
                                    textTransform: "none",
                                    minWidth: 0,
                                    fontWeight: active ? 700 : 500,
                                    border: 1,
                                    borderColor: active ? "primary.main" : "transparent",
                                    bgcolor: active ? "background.paper" : "transparent",
                                    boxShadow: active ? 1 : 0,
                                    "&:hover": {
                                        bgcolor: active ? "background.paper" : "action.selected",
                                    },
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
                    spacing={1}
                    alignItems="center"
                >
                    <IconButton
                        onClick={toggleTheme}
                        color="inherit"
                        sx={{ border: 1, borderColor: "divider" }}
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
                        sx={{
                            px: 1,
                            py: 0.5,
                            borderRadius: 2,
                            border: 1,
                            borderColor: "divider",
                        }}
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
                        sx={{ textTransform: "none", borderRadius: 2 }}
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