import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { usePortfolioMarks } from "./lib/usePortfolioMarks";
import "./index.css";

function Root() {
  const marks = usePortfolioMarks();
  return <App marks={marks} />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
