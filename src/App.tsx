import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import Login from "@/pages/Login";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import Dashboard from "@/pages/Dashboard";
import Providers from "@/pages/Providers";
import ClientManagement from "@/pages/ClientManagement";
import DietPlans from "@/pages/DietPlans";
import DietManagement from "@/pages/DietManagement";
import Prescriptions from "@/pages/Prescriptions";
import Appointments from "@/pages/Appointments";
import Account from "@/pages/Account";
import AdminManagement from "@/pages/AdminManagement";
import SettingsPage from "@/pages/SettingsPage";
import NotFound from "@/pages/NotFound";
import CalendarPage from "./pages/CalendarPage";
import Messages from "./pages/Messages";
import Subscriptions from "./pages/Subscriptions";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              <Route element={<ProtectedRoute />}>
                <Route element={<DashboardLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/clients" element={<ClientManagement />} />
                  <Route path="/diet-plans" element={<DietPlans />} />
                  <Route path="/diet-management" element={<DietManagement />} />
                  <Route path="/prescriptions" element={<Prescriptions />} />
                  <Route path="/appointments" element={<Appointments />} />
                  <Route path="/calendar" element={<CalendarPage />} />
                  <Route path="/account" element={<Account />} />
                  <Route path="/providers" element={<Providers />} />
                  <Route path="/subscriptions" element={<Subscriptions />} />
                  <Route
                    path="/admin-management"
                    element={<AdminManagement />}
                  />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/messages" element={<Messages />} />
                </Route>
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
