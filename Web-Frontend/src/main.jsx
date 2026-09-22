
import React from "react";
import ReactDOM from "react-dom/client";
import ThemeProvider from "./providers/ThemeProvider";
import { AuthProvider } from "./modules/auth/context/AuthContext";

import '@fontsource/lexend/300.css';
import '@fontsource/lexend/400.css';
import '@fontsource/lexend/500.css';
import '@fontsource/lexend/600.css';
import '@fontsource/lexend/700.css';
import './index.css';

import App from './App.jsx';

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
   <ThemeProvider>
  <AuthProvider>
    <App />
  </AuthProvider>
</ThemeProvider>
  </React.StrictMode>
);

