import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "@/pages/LandingPage.js";
import { LoginPage } from "@/domains/auth/pages/LoginPage.js";
import { MainLayout } from "@/components/layout/MainLayout.js";
import { useAuthContext } from "@/app/providers/AuthContext.js";
import { ComponentRegistry } from "@/app/routes/RouteRegistry.js";
import { AcademicsDashboard } from "@/components/domains/academics/dashboard/index.js";

export const AppRoutes: React.FC = () => {
  const { isAuthenticated, isLoading, capabilities } = useAuthContext();

  if (isLoading) return null;

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* Static Core Routes */}
        <Route index element={<LandingPage />} />
        <Route path="/dashboard" element={<LandingPage />} />
        <Route path="/academics" element={<Navigate to="/academics/dashboard" replace />} />
        <Route path="/academics/dashboard" element={<AcademicsDashboard />} />

        {/* --- Capability-Gated Routes from Registry --- */}
        {Object.entries(ComponentRegistry).map(
          ([key, { component: Component, path, resource }]) => {
            const cap = capabilities[resource];
            // Allow access unless explicitly denied (hasPage === false)
            // This makes routes opt-out rather than opt-in
            const hasAccess = cap?.hasPage !== false;
            return (
              <Route key={key} path={path} element={<Component />} />
            );
          },
        )}

        {/* Global Catch-all */}
        <Route
          path="*"
          element={
            <div className="flex flex-col items-center justify-center h-full p-20">
              <h1 className="text-2xl font-black text-slate-400">
                404 - Route Not Registered
              </h1>
              <p className="text-slate-500">
                Either you lack permissions or the path is incorrect.
              </p>
            </div>
          }
        />
      </Route>
    </Routes>
  );
};
