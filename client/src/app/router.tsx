import { createBrowserRouter, Navigate } from "react-router-dom";
import AuthPage from "../pages/auth/AuthPage";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminRoute from "../components/AdminRoute";
import DashboardLayout from "../layouts/DashboardLayout";
import OverviewPage from "../pages/user/OverviewPage";
import WorkflowsPage from "../pages/user/WorkflowsPage";
import RoutePlaceholder from "../components/RoutePlaceholder";

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
                    { path: "/requests", element: <RoutePlaceholder title="Requests" /> },
                    { path: "/approvals", element: <RoutePlaceholder title="Approvals" /> },
                    { path: "/settings", element: <RoutePlaceholder title="Settings" /> },
                    {
                        element: <AdminRoute />,
                        children: [
                            {
                                path: "/admin",
                                element: <RoutePlaceholder title="Admin Dashboard" />,
                            },
                            {
                                path: "/admin/users",
                                element: <RoutePlaceholder title="User Management" />,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        path: "*",
        element: <RoutePlaceholder title="Page not found" />,
    },
]);
