/**
 * useLocalStorage.js
 * Hook customizado para persistência de dados no localStorage
 */

import { useState, useEffect } from "react";

/**
 * Hook para gerenciar estado com persistência no localStorage
 * @param {string} key - Chave do localStorage
 * @param {any} initialValue - Valor inicial
 * @returns {[any, Function]} - [valor, setValue]
 */
export function useLocalStorage(key, initialValue) {
  // Estado para armazenar o valor
  const [storedValue, setStoredValue] = useState(() => {
    try {
      // Tentar obter do localStorage
      const item = window.localStorage.getItem(key);

      // Se existir, fazer parse e retornar
      if (item) {
        return JSON.parse(item);
      }

      // Caso contrário, retornar valor inicial
      return initialValue;
    } catch (error) {
      console.error(`Erro ao ler localStorage [${key}]:`, error);
      return initialValue;
    }
  });

  // Função para atualizar o valor
  const setValue = (value) => {
    try {
      // Permitir função como argumento (como useState)
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;

      // Atualizar estado
      setStoredValue(valueToStore);

      // Salvar no localStorage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Erro ao salvar localStorage [${key}]:`, error);
    }
  };

  // Função para remover do localStorage
  const removeValue = () => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Erro ao remover localStorage [${key}]:`, error);
    }
  };

  return [storedValue, setValue, removeValue];
}

/**
 * Hook para sincronizar múltiplas abas/janelas
 */
export function useLocalStorageSync(key, initialValue) {
  const [storedValue, setStoredValue, removeValue] = useLocalStorage(
    key,
    initialValue,
  );

  useEffect(() => {
    // Listener para mudanças em outras abas
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error("Erro ao sincronizar localStorage:", error);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [key, setStoredValue]);

  return [storedValue, setStoredValue, removeValue];
}

/**
 * Hook para gerenciar preferências do usuário
 */
export function useUserPreferences() {
  const [preferences, setPreferences, resetPreferences] = useLocalStorage(
    "mot_preferences",
    {
      theme: "light",
      autoRefresh: true,
      refreshInterval: 30000,
      selectedDevice: "meu-end-device-teste",
      chartPeriod: "24h",
      notificationsEnabled: true,
      darkMode: false,
    },
  );

  const updatePreference = (key, value) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return {
    preferences,
    updatePreference,
    resetPreferences,
  };
}

/**
 * Hook para gerenciar cache de dados
 */
export function useCachedData(key, fetcher, options = {}) {
  const {
    ttl = 60000, // 1 minuto por padrão
    enabled = true,
  } = options;

  const [cachedData, setCachedData] = useLocalStorage(key, {
    data: null,
    timestamp: null,
  });

  const [isStale, setIsStale] = useState(true);

  useEffect(() => {
    const now = Date.now();
    const isCacheValid =
      cachedData.timestamp && now - cachedData.timestamp < ttl;

    setIsStale(!isCacheValid);
  }, [cachedData, ttl]);

  const refresh = async () => {
    if (!enabled) return;

    try {
      const data = await fetcher();
      setCachedData({
        data,
        timestamp: Date.now(),
      });
      return data;
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      throw error;
    }
  };

  return {
    data: cachedData.data,
    isStale,
    refresh,
    clear: () => setCachedData({ data: null, timestamp: null }),
  };
}

/**
 * Hook para gerenciar histórico de ações
 */
export function useHistory(maxSize = 50) {
  const [history, setHistory, clearHistory] = useLocalStorage(
    "mot_history",
    [],
  );

  const addToHistory = (action, data = {}) => {
    setHistory((prev) => [
      {
        id: Date.now(),
        action,
        data,
        timestamp: new Date().toISOString(),
      },
      ...prev.slice(0, maxSize - 1),
    ]);
  };

  const removeFromHistory = (id) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  return {
    history,
    addToHistory,
    removeFromHistory,
    clearHistory,
  };
}
