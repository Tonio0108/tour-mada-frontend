import "./App.css";
import { AppRouter } from "./router/AppRouter";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "./hooks/useAuth";
import { NotificationProvider } from "./context/NotificationContext";

function App() {
  const { user } = useAuth();
  
  return (
    <TooltipProvider>
      <NotificationProvider user={user}>
        <AppRouter />
        <Toaster position="top-center" richColors />
      </NotificationProvider>
    </TooltipProvider>
  );
}

export default App;

