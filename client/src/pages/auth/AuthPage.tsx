
import { useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    Alert,
    Avatar,
    Box,
    Button,
    CircularProgress,
    Container,
    InputAdornment,
    Paper,
    TextField,
    Typography,
    IconButton,
} from "@mui/material";
import AccountTreeRoundedIcon from "@mui/icons-material/AccountTreeRounded";
import AlternateEmailRoundedIcon from "@mui/icons-material/AlternateEmailRounded";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import { useAuth } from "../../hooks/useAuth";
import "../../App.css";

export default function AuthPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { signIn, signUp, error, clearError } = useAuth();

    const [mode, setMode] = useState<"login" | "register">(
        location.pathname === "/register" ? "register" : "login",
    );
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [notice, setNotice] = useState("");

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        clearError();
        setNotice("");
        setLoading(true);

        try {
            if (mode === "register") {
                await signUp(name.trim(), email.trim(), password);
                setNotice("Account created successfully. Please sign in.");
                setPassword("");
                setMode("login");
                navigate("/login", { replace: true });
                return;
            }

            const authenticatedUser = await signIn(email.trim(), password);

            if (authenticatedUser.systemRole === "ADMIN") {
                navigate("/admin", { replace: true });
            } else {
                const from = (
                    location.state as { from?: string } | null
                )?.from;

                navigate(from && !from.startsWith("/admin") ? from : "/overview", {
                    replace: true,
                });
            }
        } catch {
            // The error message is supplied by AuthContext.
        } finally {
            setLoading(false);
        }
    }

    function changeMode() {
        const nextMode = mode === "login" ? "register" : "login";
        setMode(nextMode);
        clearError();
        setNotice("");
        navigate(nextMode === "login" ? "/login" : "/register", {
            replace: true,
        });
    }

    return (
        <Box className="auth-screen">
            <Box className="auth-brand">
                <Avatar className="brand-icon">
                    <AccountTreeRoundedIcon />
                </Avatar>
                <Typography variant="h5">FlowPilot</Typography>
            </Box>

            <Container maxWidth="sm" className="auth-container">
                <Paper className="auth-card" elevation={0}>
                    <Box className="auth-heading">
                        <Typography className="eyebrow">
                            WORKFLOW MANAGEMENT, SIMPLIFIED
                        </Typography>
                        <Typography variant="h3">
                            {mode === "login" ? "Welcome back." : "Get started."}
                        </Typography>
                        <Typography color="text.secondary">
                            {mode === "login"
                                ? "Sign in to continue to your workspace."
                                : "Create your account and start building better workflows."}
                        </Typography>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {notice && (
                        <Alert severity="success" sx={{ mb: 2 }}>
                            {notice}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit} noValidate>
                        {mode === "register" && (
                            <TextField
                                label="Full name"
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                required
                                fullWidth
                                margin="normal"
                                autoComplete="name"
                                slotProps={{
                                    htmlInput: { minLength: 2, maxLength: 100 },
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <PersonOutlineRoundedIcon />
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                            />
                        )}

                        <TextField
                            label="Email address"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            required
                            fullWidth
                            margin="normal"
                            autoComplete="email"
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <AlternateEmailRoundedIcon />
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />

                        <TextField
                            label="Password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            required
                            fullWidth
                            margin="normal"
                            autoComplete={
                                mode === "login" ? "current-password" : "new-password"
                            }
                            slotProps={{
                                htmlInput: {
                                    minLength: mode === "register" ? 12 : 1,
                                    maxLength: 72,
                                },
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LockOutlinedIcon />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label={
                                                    showPassword ? "Hide password" : "Show password"
                                                }
                                                onClick={() => setShowPassword((value) => !value)}
                                                edge="end"
                                            >
                                                {showPassword ? (
                                                    <VisibilityOffRoundedIcon />
                                                ) : (
                                                    <VisibilityRoundedIcon />
                                                )}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            className="submit-button"
                            disabled={
                                loading ||
                                !email.trim() ||
                                !password ||
                                (mode === "register" && !name.trim())
                            }
                            sx={{ mt: 2 }}
                        >
                            {loading ? (
                                <CircularProgress size={23} color="inherit" />
                            ) : mode === "login" ? (
                                "Sign in"
                            ) : (
                                "Create account"
                            )}
                        </Button>
                    </Box>

                    <Box className="auth-switch">
                        <Typography color="text.secondary">
                            {mode === "login"
                                ? "Don't have an account?"
                                : "Already have an account?"}
                        </Typography>
                        <Button onClick={changeMode}>
                            {mode === "login" ? "Create account" : "Sign in"}
                        </Button>
                    </Box>
                </Paper>

                <Typography className="auth-footer">
                    FLOWPILOT · WORK SMARTER, TOGETHER
                </Typography>
            </Container>
        </Box>
    );
}
