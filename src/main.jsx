import { BrowserRouter } from "react-router";
import App from "./App";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from 'react-helmet-async';
import "./i18n";

createRoot(document.getElementById("root")).render(
  <HelmetProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </HelmetProvider>
);
