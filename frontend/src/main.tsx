import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Router from "./router";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
        <Router />
  </StrictMode>
);
