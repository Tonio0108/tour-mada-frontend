import "./App.css";
import { AppRouter } from "./router/AppRouter";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

function App() {
  return (
    <TooltipProvider>
      <AppRouter />
      <Toaster position="top-center" richColors />
    </TooltipProvider>
  );
}

export default App;

