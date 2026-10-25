import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
    AppBar,
    Avatar,
    Box,
    Button,
    Divider,
    Drawer,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import AccountTreeRoundedIcon from "@mui/icons-material/AccountTreeRounded";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import ApprovalRoundedIcon from "@mui/icons-material/ApprovalRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import { useAuth } from "../hooks/useAuth";

const drawerWidth = 250;

const userLinks = [
    { label: "Overview", path: "/overview", icon: <DashboardRoundedIcon /> },
    { label: "Workflows", path: "/workflows", icon: <AccountTreeRoundedIcon /> },
    { label: "Requests", path: "/requests", icon: <AssignmentRoundedIcon /> },
    { label: "Approvals", path: "/approvals", icon: <ApprovalRoundedIcon /> },
    { label: "Settings", path: "/settings", icon: <SettingsRoundedIcon /> },
];

const adminLinks = [
    { label: "Admin Dashboard", path: "/admin", icon: <AdminPanelSettingsRoundedIcon /> },
    { label: "User Management", path: "/admin/users", icon: <AssignmentRoundedIcon /> },
];

export default function DashboardLayout() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const [mobileOpen, setMobileOpen] = useState(false);

    const isAdmin = user?.systemRole === "ADMIN";
    const links = isAdmin ? [...userLinks, ...adminLinks] : userLinks;

    async function handleLogout() {
        await signOut();
        navigate("/login", { replace: true });
    }

    const drawerContent = (
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <Box sx={{ px: 3, py: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: "primary.main" }}>                    FlowPilot
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    Workflow management
                </Typography>
            </Box>

            <Divider />

            <List sx={{ px: 1.5, py: 2, flexGrow: 1 }}>
                {links.map((link) => (
                    <ListItemButton
                        key={link.path}
                        component={NavLink}
                        to={link.path}
                        onClick={() => setMobileOpen(false)}
                        sx={{
                            borderRadius: 2,
                            mb: 0.5,
                            "&.active": {
                                backgroundColor: "primary.main",
                                color: "primary.contrastText",
                                "& .MuiListItemIcon-root": {
                                    color: "inherit",
                                },
                            },
                        }}
                    >
                        <ListItemIcon
                            sx={{
                                minWidth: 44,
                                "& .MuiSvgIcon-root": {
                                    fontSize: 26,
                                },
                            }}
                        >
                            {link.icon}
                        </ListItemIcon>                        <ListItemText primary={link.label} />
                    </ListItemButton>
                ))}
            </List>

            <Divider />

            <Box sx={{ p: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                    <Avatar>{user?.name?.charAt(0)?.toUpperCase() || "U"}</Avatar>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>                            {user?.name || "User"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>
                            {user?.email}
                        </Typography>
                    </Box>
                </Box>

                <Button
                    fullWidth
                    startIcon={<LogoutRoundedIcon />}
                    onClick={handleLogout}
                    variant="outlined"
                >
                    Sign out
                </Button>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f7f8fc" }}>
            {isMobile && (
                <AppBar position="fixed" color="inherit" elevation={1}>
                    <Toolbar>
                        <Button
                            aria-label="Open navigation"
                            onClick={() => setMobileOpen(true)}
                            sx={{ minWidth: 40 }}
                        >
                            <MenuRoundedIcon />
                        </Button>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: "primary.main" }}>                            FlowPilot
                        </Typography>
                    </Toolbar>
                </AppBar>
            )}

            {isMobile ? (
                <Drawer
                    open={mobileOpen}
                    onClose={() => setMobileOpen(false)}
                    sx={{
                        "& .MuiDrawer-paper": {
                            width: drawerWidth,
                            boxSizing: "border-box",
                        },
                    }}
                >
                    {drawerContent}
                </Drawer>
            ) : (
                <Drawer
                    variant="permanent"
                    sx={{
                        width: drawerWidth,
                        flexShrink: 0,
                        "& .MuiDrawer-paper": {
                            width: drawerWidth,
                            boxSizing: "border-box",
                            borderRight: "1px solid #e5e7eb",
                        },
                    }}
                >
                    {drawerContent}
                </Drawer>
            )}

            <Box
                component="main"
                sx={{
                    flex: "1 1 0%",
                    minWidth: 0,
                    width: "100%",
                    maxWidth: "100%",
                    boxSizing: "border-box",
                    p: { xs: 2, sm: 3, md: 4 },
                    mt: isMobile ? "56px" : 0,
                }}
            >
                <Outlet />
            </Box>
        </Box>
    );
}
