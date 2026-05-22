// frontend/src/App.tsx
import React from "react";
import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./app/routes/AppRoutes.js";
import { AuthProvider } from "./app/providers/AuthContext.js";

// If you have other global providers (e.g. ThemeProvider, QueryClientProvider),
// you can wrap them here as well.

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
