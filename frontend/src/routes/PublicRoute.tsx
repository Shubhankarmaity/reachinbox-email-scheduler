import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export function PublicRoute() {
  const { authenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-slate-600 border-t-white" />
          <p className="text-sm text-slate-400">
            Loading ReachInbox...
          </p>
        </div>
      </div>
    );
  }

  if (authenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}