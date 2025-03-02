import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";

import { TempoDevtools } from "tempo-devtools";
TempoDevtools.init();

// Import Supabase for global access
import { supabase } from "./lib/supabase";

// Make supabase available globally for debugging
// @ts-ignore
window.supabase = supabase;

const basename = import.meta.env.BASE_URL;

// Scroll to top on page load
window.onload = () => {
  window.scrollTo(0, 0);
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
