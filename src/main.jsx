import { BrowserRouter } from "react-router";
import App from "./App";
import { createRoot } from "react-dom/client";
import "./i18n";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

