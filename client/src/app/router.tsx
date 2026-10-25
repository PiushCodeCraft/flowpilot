import { createBrowserRouter, Navigate } from "react-router-dom";
import AuthPage from "../pages/auth/AuthPage";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminRoute from "../components/AdminRoute";
import DashboardLayout from "../layouts/DashboardLayout";
import OverviewPage from "../pages/user/OverviewPage";
import WorkflowsPage from "../pages/user/WorkflowsPage";

function Placeholder({ title }: { title: string }) {
    return (
        <div>
            <h1>{title}</h1>
            <p>This section is being developed.</p>
        </div>
    );
}

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Navigate to="/overview" replace />,
    },
    {
        path: "/login",
        element: <AuthPage />,
    },
    {
        path: "/register",
        element: <AuthPage />,
    },
    {
        element: <ProtectedRoute />,
        children: [
            {
                element: <DashboardLayout />,
                children: [
                    { path: "/overview", element: <OverviewPage /> },
                    { path: "/workflows", element: <WorkflowsPage /> }, 
                    { path: "/requests", element: <Placeholder title="Requests" /> },
                    { path: "/approvals", element: <Placeholder title="Approvals" /> },
                    { path: "/settings", element: <Placeholder title="Settings" /> },
                    {
                        element: <AdminRoute />,
                        children: [
                            { path: "/admin", element: <Placeholder title="Admin Dashboard" /> },
                            {
                                path: "/admin/users",
                                element: <Placeholder title="User Management" />,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        path: "*",
        element: <Placeholder title="Page not found" />,
    },
]);
