import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Issues from "./pages/Issues";
import IssueDetails from "./pages/IssueDetails";
import AssignWorker from "./pages/AssignWorker";
import WorkerDetails from "./pages/WorkerDetails";
import Profile from "./pages/Profile";
import Reports from "./pages/Reports";

import CreateProfile from "./pages/CreateProfile";
import NotFound from "./pages/NotFound";
import WorkerCreated from "./pages/WorkerCreated";

const queryClient = new QueryClient();


// Auth bypass for testing: do not protect any routes

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
  <BrowserRouter future={{ v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/issues" element={<Issues />} />
          <Route path="/issues/:id" element={<IssueDetails />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/assign-worker" element={<AssignWorker />} />
          <Route path="/workers/:id" element={<WorkerDetails />} />
          <Route path="/create-profile" element={<CreateProfile />} />
          <Route path="/worker-created" element={<WorkerCreated />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
