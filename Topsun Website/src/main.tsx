
import { createRoot } from "react-dom/client";
import Routes from "./app/routes/Routes";
import { ShoppingProvider } from "./app/context/ShoppingContext";
import { AuthProvider } from "./app/context/AuthContext";
import { ErrorBoundary } from "./app/components/ErrorBoundary";
import "./styles/index.css";

// Global error handler
window.addEventListener('error', (event) => {
  // Silent in production
});

window.addEventListener('unhandledrejection', (event) => {
  // Silent in production
});

try {
  const root = document.getElementById("root");
  if (!root) {
    throw new Error("Root element not found in DOM");
  }

  console.log("📦 Rendering React components...");
  
  createRoot(root).render(
    <ErrorBoundary>
      <AuthProvider>
        <ShoppingProvider>
          <Routes />
        </ShoppingProvider>
      </AuthProvider>
    </ErrorBoundary>
  );

  console.log("✅ React app mounted successfully\n");
} catch (err: any) {
  console.error("❌ Failed to initialize React app:", err);
  console.error("Stack trace:", err.stack);
  if (document.getElementById("root")) {
    document.getElementById("root")!.innerHTML =
      '<div style="display:flex;align-items:center;justify-content:center;min-height:100vh;color:#999;font-family:system-ui"><div><h2>Application Error</h2><p>Failed to initialize the application</p><p style="font-size:12px;margin-top:10px;color:#666">' + (err?.message || 'Unknown error') + '</p><p style="font-size:12px;margin-top:10px">Check browser console for details</p></div></div>';
  }
}
  