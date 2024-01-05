import React from "react";
import { createRoot } from "react-dom/client";
import App from "./components/app";
import Summit from "./services/summit";
import { ServiceType } from "./constants/enums";

(() => {
  window.Summit = Summit.getService<Summit>(ServiceType.Summit);
  const summitContainer = document.getElementById("summitContainer");
  if (!summitContainer) throw new Error("No root element found");
  const root = createRoot(summitContainer);
  root.render(<App />);
})();
