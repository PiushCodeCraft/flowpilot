
import { useCallback, useEffect, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import AccountTreeRoundedIcon from "@mui/icons-material/AccountTreeRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import { apiRequest } from "../../services/api";

interface Workflow {
    id: string;
    organizationId: string;
    name: string;
    description: string | null;
    status: string;
    createdAt: string;
    updatedAt: string;
    _count: { requests: number };
}

interface WorkflowsResponse {
    success: boolean;
    data: Workflow[];
}

interface CreateWorkflowResponse {
    success: boolean;
    message: string;
    data: Workflow;
}

export default function WorkflowsPage() {
    const [workflows, setWorkflows] = useState<Workflow[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    const loadWorkflows = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const response = await apiRequest<WorkflowsResponse>("/api/workflows");
            setWorkflows(response.data);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Unable to load workflows.",
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadWorkflows();
    }, [loadWorkflows]);

    function openCreateDialog() {
        setName("");
        setDescription("");
        setError("");
        setNotice("");
        setDialogOpen(true);
    }

    async function handleCreateWorkflow() {
        const trimmedName = name.trim();
        const trimmedDescription = description.trim();

        if (!trimmedName) {
            setError("Please enter a workflow name.");
            return;
        }

        if (trimmedName.length > 120) {
            setError("Workflow name must be 120 characters or fewer.");
            return;
        }

        if (trimmedDescription.length > 2000) {
            setError("Description must be 2000 characters or fewer.");
            return;
        }

        setSaving(true);
        setError("");
        setNotice("");

        try {
            const response = await apiRequest<CreateWorkflowResponse>(
                "/api/workflows",
                {
                    method: "POST",
                    body: JSON.stringify({
                        name: trimmedName,
                        description: trimmedDescription || undefined,
                    }),
                },
            );

            setWorkflows((current) => [
                response.data,
                ...current.filter((workflow) => workflow.id !== response.data.id),
            ]);

            setDialogOpen(false);
            setName("");
            setDescription("");
            setNotice("Workflow created successfully.");
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Unable to create workflow.",
            );
        } finally {
            setSaving(false);
        }
    }

    return (
        <Box>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    alignItems: { xs: "stretch", sm: "center" },
                    justifyContent: "space-between",
                    gap: 2,
                    mb: 4,
                }}
            >
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
                        Workflows
                    </Typography>
                    <Typography color="text.secondary">
                        View and manage your organization's workflows.
                    </Typography>
                </Box>

                <Stack direction="row" spacing={1}>
                    <Button
                        variant="outlined"
                        startIcon={<RefreshRoundedIcon />}
                        onClick={() => void loadWorkflows()}
                        disabled={loading}
                    >
                        Refresh
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<AddRoundedIcon />}
                        onClick={openCreateDialog}
                    >
                        Create Workflow
                    </Button>
                </Stack>
            </Box>

            {error && (
                <Alert severity="error" onClose={() => setError("")} sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {notice && (
                <Alert severity="success" onClose={() => setNotice("")} sx={{ mb: 3 }}>
                    {notice}
                </Alert>
            )}

            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                    <CircularProgress />
                </Box>
            ) : workflows.length === 0 ? (
                <Card
                    elevation={0}
                    sx={{
                        border: "1px solid #e5e7eb",
                        borderRadius: 3,
                        textAlign: "center",
                        py: 6,
                        px: 3,
                    }}
                >
                    <CardContent>
                        <AccountTreeRoundedIcon
                            sx={{ fontSize: 52, color: "text.secondary", mb: 2 }}
                        />
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                            No workflows yet
                        </Typography>
                        <Typography color="text.secondary" sx={{ mb: 3 }}>
                            Create your first workflow to start organizing and tracking work.
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<AddRoundedIcon />}
                            onClick={openCreateDialog}
                        >
                            Create your first workflow
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: {
                            xs: "1fr",
                            md: "repeat(2, minmax(0, 1fr))",
                            xl: "repeat(3, minmax(0, 1fr))",
                        },
                        gap: 3,
                    }}
                >
                    {workflows.map((workflow) => (
                        <Card
                            key={workflow.id}
                            elevation={0}
                            sx={{
                                border: "1px solid #e5e7eb",
                                borderRadius: 3,
                                height: "100%",
                            }}
                        >
                            <CardContent sx={{ p: 3 }}>
                                <Box
                                    sx={{
                                        display: "flex",
                                        flexDirection: "row",
                                        alignItems: "flex-start",
                                        justifyContent: "space-between",
                                        gap: 2,
                                        mb: 2,
                                    }}
                                >
                                    <AccountTreeRoundedIcon color="primary" />
                                    <Chip
                                        size="small"
                                        label={workflow.status.replace(/_/g, " ")}
                                        color={
                                            workflow.status === "ACTIVE" ? "success" : "default"
                                        }
                                        variant="outlined"
                                    />
                                </Box>

                                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                                    {workflow.name}
                                </Typography>

                                <Typography
                                    color="text.secondary"
                                    variant="body2"
                                    sx={{ minHeight: 40, mb: 3, overflowWrap: "anywhere" }}
                                >
                                    {workflow.description || "No description provided."}
                                </Typography>

                                <Box
                                    sx={{
                                        display: "flex",
                                        flexDirection: "row",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                    }}
                                >
                                    <Typography variant="body2" color="text.secondary">
                                        Requests
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                        {workflow._count.requests}
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            )}

            <Dialog
                open={dialogOpen}
                onClose={() => {
                    if (!saving) setDialogOpen(false);
                }}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle sx={{ fontWeight: 800 }}>Create Workflow</DialogTitle>

                <DialogContent>
                    <Stack spacing={2.5} sx={{ pt: 1 }}>
                        <TextField
                            label="Workflow name"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            required
                            fullWidth
                            autoFocus
                            slotProps={{
                                htmlInput: { maxLength: 120 },
                            }} placeholder="e.g. Employee Onboarding"
                        />

                        <TextField
                            label="Description"
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                            fullWidth
                            multiline
                            minRows={3}
                            slotProps={{
                                htmlInput: { maxLength: 2000 },
                            }} placeholder="Describe what this workflow is for..."
                        />

                        {error && (
                            <Alert severity="error" onClose={() => setError("")}>
                                {error}
                            </Alert>
                        )}
                    </Stack>
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 2.5 }}>
                    <Button
                        onClick={() => setDialogOpen(false)}
                        disabled={saving}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => void handleCreateWorkflow()}
                        disabled={saving}
                    >
                        {saving ? "Creating..." : "Create Workflow"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
