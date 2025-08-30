import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { SignalRContextProvider } from "./contexts/SignalRContext.jsx";
import { AuthContextProvider } from "./contexts/AuthContext.jsx";
import { ApolloProvider } from "@apollo/client";
import { AppDataContextProvider } from "./contexts/AppDataContext.jsx";
import { apollo } from "./lib/apollo.js";

createRoot(document.getElementById("root")).render(
  <BrowserRouter
    future={{
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    }}
  >
    <AuthContextProvider>
      <AppDataContextProvider>
        <ApolloProvider client={apollo}>
          <SignalRContextProvider>
            <App />
          </SignalRContextProvider>
        </ApolloProvider>
      </AppDataContextProvider>
    </AuthContextProvider>
  </BrowserRouter>
);
