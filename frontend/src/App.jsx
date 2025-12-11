/**
 * App.jsx
 * Componente raiz da aplicação React
 */

import React, { useState, useEffect } from "react";
import MOTDashboard from "./components/MOTDashboard";
import { useUserPreferences } from "./hooks/useLocalStorage";
import { APP_NAME, APP_VERSION } from "./utils/constants";
import "./App.css";

export default function App() {
  const { preferences, updatePreference } = useUserPreferences();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  /**
   * Monitorar status de conexão
   */
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  /**
   * Aplicar tema
   */
  useEffect(() => {
    const isDark = preferences.darkMode;
    const root = document.documentElement;

    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [preferences.darkMode]);

  return (
    <div className={`min-h-screen ${preferences.darkMode ? "dark" : ""}`}>
      {/* Status de Conexão */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-red-500 text-white p-3 text-center z-50">
          ⚠️ Você está offline. Algumas funcionalidades podem não estar
          disponíveis.
        </div>
      )}

      {/* Dashboard Principal */}
      <MOTDashboard />

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 text-center py-6 mt-12">
        <p className="text-sm">
          {APP_NAME} v{APP_VERSION} • Monitoramento LoRaWAN • Desenvolvido com
          React + Recharts
        </p>
        <p className="text-xs text-gray-500 mt-2">
          © 2025 Metodologia TpM - Unicamp
        </p>
      </footer>
    </div>
  );
}
