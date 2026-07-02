import "./App.css";
import { AppRouter } from "./router/AppRouter";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";

function AppContent() {
  const { user } = useAuth();
  
  return (
    <NotificationProvider user={user}>
      <AppRouter />
      <Toaster position="top-center" richColors />
    </NotificationProvider>
  );
}

function App() {
  return (
    <TooltipProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </TooltipProvider>
  );
}

export default App;

