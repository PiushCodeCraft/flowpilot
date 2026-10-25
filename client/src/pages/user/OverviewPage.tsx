
import { useEffect, useState } from "react";
import {
    Alert,
    Box,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Grid,
    Typography,
} from "@mui/material";
import AccountTreeRoundedIcon from "@mui/icons-material/AccountTreeRounded";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import ApprovalRoundedIcon from "@mui/icons-material/ApprovalRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { apiRequest } from "../../services/api";

interface RecentRequest {
    id: string;
    title: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    workflowDefinition?: {
        name: string;
    } | null;
    createdBy?: {
        name: string;
    } | null;
}

interface DashboardSummary {
    totalWorkflows: number;
    pendingRequests: number;
    pendingApprovals: number;
    completedThisMonth: number;
    recentRequests: RecentRequest[];
}

interface DashboardResponse {
    success: boolean;
    data: DashboardSummary;
}

const emptySummary: DashboardSummary = {
    totalWorkflows: 0,
    pendingRequests: 0,
    pendingApprovals: 0,
    completedThisMonth: 0,
    recentRequests: [],
};

const statDefinitions = [
    {
        title: "Total Workflows",
        key: "totalWorkflows",
        description: "Your organization's workflows",
        icon: <AccountTreeRoundedIcon />,
    },
    {
        title: "Pending Requests",
        key: "pendingRequests",
        description: "Awaiting processing",
        icon: <AssignmentRoundedIcon />,
    },
    {
        title: "Pending Approvals",
        key: "pendingApprovals",
        description: "Require your attention",
        icon: <ApprovalRoundedIcon />,
    },
    {
        title: "Completed This Month",
        key: "completedThisMonth",
        description: "Approved this month",
        icon: <CheckCircleRoundedIcon />,
    },
] as const;

export default function OverviewPage() {
    const [summary, setSummary] =
        useState<DashboardSummary>(emptySummary);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        async function loadDashboard() {
            setLoading(true);
            setError("");

            try {
                const response = await apiRequest<DashboardResponse>(
                    "/api/dashboard/summary",
                );

                if (active) {
                    setSummary(response.data);
                }
            } catch (err) {
                if (active) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Unable to load dashboard data.",
                    );
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        void loadDashboard();

        return () => {
            active = false;
        };
    }, []);

    return (
        <Box>
            <Box sx={{ mb: 4 }}>
                <Typography
                    variant="h4"
                    sx={{ fontWeight: 800, mb: 1 }}
                >
                    Overview
                </Typography>

                <Typography color="text.secondary">
                    Welcome to FlowPilot. Manage your workflows and track your activity.
                </Typography>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <Grid container spacing={3}>
                {statDefinitions.map((stat) => (
                    <Grid
                        size={{ xs: 12, sm: 6, xl: 3 }}
                        key={stat.key}
                    >
                        <Card
                            elevation={0}
                            sx={{
                                height: "100%",
                                border: "1px solid #e5e7eb",
                                borderRadius: 3,
                            }}
                        >
                            <CardContent sx={{ p: 3 }}>
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        mb: 2,
                                    }}
                                >
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        {stat.title}
                                    </Typography>

                                    <Box
                                        sx={{
                                            color: "primary.main",
                                            display: "flex",
                                            alignItems: "center",
                                            "& .MuiSvgIcon-root": {
                                                fontSize: 30,
                                            },
                                        }}
                                    >
                                        {stat.icon}
                                    </Box>
                                </Box>

                                <Typography
                                    variant="h4"
                                    sx={{ fontWeight: 800, mb: 1 }}
                                >
                                    {loading ? (
                                        <CircularProgress size={28} />
                                    ) : (
                                        summary[stat.key]
                                    )}
                                </Typography>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    {stat.description}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Card
                elevation={0}
                sx={{
                    mt: 4,
                    border: "1px solid #e5e7eb",
                    borderRadius: 3,
                }}
            >
                <CardContent sx={{ p: 3 }}>
                    <Typography
                        variant="h6"
                        sx={{ fontWeight: 700, mb: 2 }}
                    >
                        Recent Requests
                    </Typography>

                    {loading ? (
                        <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                            <CircularProgress />
                        </Box>
                    ) : summary.recentRequests.length === 0 ? (
                        <Typography color="text.secondary">
                            No workflow requests found yet.
                        </Typography>
                    ) : (
                        <Box>
                            {summary.recentRequests.map((request, index) => (
                                <Box
                                    key={request.id}
                                    sx={{
                                        py: 2,
                                        borderBottom:
                                            index < summary.recentRequests.length - 1
                                                ? "1px solid #e5e7eb"
                                                : "none",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        gap: 2,
                                        flexWrap: "wrap",
                                    }}
                                >
                                    <Box sx={{ minWidth: 0 }}>
                                        <Typography sx={{ fontWeight: 600 }}>
                                            {request.title}
                                        </Typography>

                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            {request.workflowDefinition?.name ??
                                                "Workflow"}{" "}
                                            · Created by{" "}
                                            {request.createdBy?.name ?? "Unknown"}
                                        </Typography>
                                    </Box>

                                    <Chip
                                        size="small"
                                        label={request.status.replace(/_/g, " ")}
                                        variant="outlined"
                                        color={
                                            request.status === "APPROVED"
                                                ? "success"
                                                : request.status === "REJECTED"
                                                    ? "error"
                                                    : "default"
                                        }
                                    />
                                </Box>
                            ))}
                        </Box>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
}
