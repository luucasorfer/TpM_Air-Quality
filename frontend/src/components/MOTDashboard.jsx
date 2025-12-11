/**
 * MOTDashboard.jsx
 * Componente principal do Dashboard MoT LoRaWAN
 * Integra todas as funcionalidades e componentes
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  AlertCircle,
  TrendingUp,
  Wifi,
  Activity,
  RefreshCw,
  Download,
  Eye,
  EyeOff,
  Moon,
  Sun,
} from "lucide-react";
import { useUserPreferences } from "../hooks/useLocalStorage";
import { SignalQualityCard } from "./SignalQualityCard";
import {
  formatTemperature,
  formatHumidity,
  formatRSSI,
  formatSNR,
  formatTime,
  formatDateTime,
  getSignalQualityDescription,
} from "../utils/formatters";
import {
  API_CONFIG,
  REFRESH_INTERVALS,
  CHART_PERIODS,
  MENU_ITEMS,
} from "../utils/constants";

const API_BASE_URL = API_CONFIG.BASE_URL;
const DEVICE_ID = API_CONFIG.DEVICE_ID;

export default function MOTDashboard() {
  // ===========================
  // STATE MANAGEMENT
  // ===========================

  const { preferences, updatePreference } = useUserPreferences();
  const [activeTab, setActiveTab] = useState("sensor");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Dados em tempo real
  const [latest, setLatest] = useState(null);
  const [readings, setReadings] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [quality, setQuality] = useState(null);

  // UI State
  const [showDetails, setShowDetails] = useState(false);
  const [selectedReading, setSelectedReading] = useState(null);

  // ===========================
  // FETCH FUNCTIONS
  // ===========================

  /**
   * Buscar última leitura do sensor
   */
  const fetchLatest = useCallback(async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/sensor/latest?device_id=${DEVICE_ID}`,
        { signal: AbortSignal.timeout(API_CONFIG.TIMEOUT) },
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setLatest(data);
      return data;
    } catch (err) {
      console.error("Erro ao buscar última leitura:", err);
      if (err.name !== "AbortError") {
        setError("Erro ao buscar última leitura");
      }
      return null;
    }
  }, []);

  /**
   * Buscar histórico de leituras
   */
  const fetchReadings = useCallback(async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/sensor/readings?device_id=${DEVICE_ID}&limit=100`,
        { signal: AbortSignal.timeout(API_CONFIG.TIMEOUT) },
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Formatar dados para gráficos
      const formattedData = data.data.map((reading) => ({
        timestamp: formatTime(reading.received_at),
        temperature: reading.temperature_celsius,
        humidity: reading.humidity_percent,
        rssi: reading.rssi,
        snr: reading.snr,
        received_at: reading.received_at,
        raw: reading,
      }));

      setReadings(formattedData.reverse());
      return formattedData;
    } catch (err) {
      console.error("Erro ao buscar leituras:", err);
      if (err.name !== "AbortError") {
        setError("Erro ao buscar histórico de leituras");
      }
      return [];
    }
  }, []);

  /**
   * Buscar estatísticas
   */
  const fetchStatistics = useCallback(async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/sensor/statistics?device_id=${DEVICE_ID}&period=${
          preferences.chartPeriod || "24h"
        }`,
        { signal: AbortSignal.timeout(API_CONFIG.TIMEOUT) },
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setStatistics(data);
      return data;
    } catch (err) {
      console.error("Erro ao buscar estatísticas:", err);
      if (err.name !== "AbortError") {
        setError("Erro ao buscar estatísticas");
      }
      return null;
    }
  }, [preferences.chartPeriod]);

  /**
   * Buscar qualidade do sinal
   */
  const fetchQuality = useCallback(async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/sensor/quality?device_id=${DEVICE_ID}&limit=100`,
        { signal: AbortSignal.timeout(API_CONFIG.TIMEOUT) },
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setQuality(data);
      return data;
    } catch (err) {
      console.error("Erro ao buscar qualidade:", err);
      if (err.name !== "AbortError") {
        setError("Erro ao buscar qualidade do sinal");
      }
      return null;
    }
  }, []);

  /**
   * Carregar todos os dados
   */
  const loadAllData = useCallback(async () => {
    setIsRefreshing(true);
    setError(null);

    try {
      await Promise.all([
        fetchLatest(),
        fetchReadings(),
        fetchStatistics(),
        fetchQuality(),
      ]);

      setLastUpdate(new Date());
      setLoading(false);
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
      setError("Erro ao carregar dados do servidor");
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchLatest, fetchReadings, fetchStatistics, fetchQuality]);

  // ===========================
  // EFFECTS
  // ===========================

  useEffect(() => {
    loadAllData();

    // Atualizar baseado no intervalo de preferência
    const interval = setInterval(
      loadAllData,
      preferences.autoRefresh ? preferences.refreshInterval : Infinity,
    );

    return () => clearInterval(interval);
  }, [loadAllData, preferences.autoRefresh, preferences.refreshInterval]);

  // ===========================
  // HELPER FUNCTIONS
  // ===========================

  /**
   * Determinar qualidade do sinal baseado em RSSI
   */
  const getSignalQuality = (rssi) => {
    return getSignalQualityDescription(rssi);
  };

  /**
   * Exportar dados como CSV
   */
  const exportAsCSV = () => {
    if (readings.length === 0) {
      alert("Nenhum dado para exportar");
      return;
    }

    const headers = [
      "Data/Hora",
      "Temperatura (°C)",
      "Umidade (%)",
      "RSSI (dBm)",
      "SNR (dB)",
    ];
    const rows = readings.map((r) => [
      formatDateTime(r.received_at),
      r.temperature.toFixed(2),
      r.humidity.toFixed(2),
      r.rssi,
      r.snr.toFixed(2),
    ]);

    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join(
      "\n",
    );

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mot-data-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  /**
   * Alternar tema
   */
  const toggleTheme = () => {
    updatePreference("darkMode", !preferences.darkMode);
  };

  // ===========================
  // RENDER COMPONENTS
  // ===========================

  if (error && loading) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-800 mb-2 text-center">
            Erro ao Carregar
          </h2>
          <p className="text-red-600 mb-6 text-center">{error}</p>
          <button
            onClick={loadAllData}
            className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition font-semibold"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  const signalQuality = quality ? getSignalQuality(quality.avg_rssi) : null;

  return (
    <div className={`min-h-screen ${preferences.darkMode ? "dark" : ""}`}>
      {/* ===========================
          HEADER
         =========================== */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            {/* Logo e Título */}
            <div className="flex items-center space-x-4">
              <div className="bg-blue-500 p-3 rounded-lg">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">MoT Dashboard</h1>
                <p className="text-blue-100 text-sm">
                  Monitoramento de Temperatura e Umidade via LoRaWAN
                </p>
              </div>
            </div>

            {/* Controles */}
            <div className="flex gap-2">
              <button
                onClick={toggleTheme}
                className="bg-blue-700 hover:bg-blue-600 p-2 rounded-lg transition"
                title="Alternar tema"
              >
                {preferences.darkMode ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={loadAllData}
                disabled={isRefreshing}
                className="bg-blue-700 hover:bg-blue-600 p-2 rounded-lg transition disabled:opacity-50"
                title="Atualizar dados"
              >
                <RefreshCw
                  className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`}
                />
              </button>
              <button
                onClick={exportAsCSV}
                className="bg-green-600 hover:bg-green-700 p-2 rounded-lg transition"
                title="Exportar como CSV"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Métricas Rápidas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="bg-blue-700 px-4 py-3 rounded-lg backdrop-blur-sm">
              <p className="text-xs text-blue-100 uppercase tracking-wider">
                Temperatura
              </p>
              <p className="text-2xl font-bold">
                {latest
                  ? formatTemperature(latest.temperature_celsius)
                  : "--°C"}
              </p>
            </div>
            <div className="bg-blue-700 px-4 py-3 rounded-lg backdrop-blur-sm">
              <p className="text-xs text-blue-100 uppercase tracking-wider">
                Umidade
              </p>
              <p className="text-2xl font-bold">
                {latest ? formatHumidity(latest.humidity_percent) : "--%"}
              </p>
            </div>
            <div className="bg-blue-700 px-4 py-3 rounded-lg backdrop-blur-sm">
              <p className="text-xs text-blue-100 uppercase tracking-wider">
                RSSI
              </p>
              <p className="text-2xl font-bold">
                {latest ? formatRSSI(latest.rssi) : "-- dBm"}
              </p>
            </div>
            <div className="bg-blue-700 px-4 py-3 rounded-lg backdrop-blur-sm">
              <p className="text-xs text-blue-100 uppercase tracking-wider">
                SNR
              </p>
              <p className="text-2xl font-bold">
                {latest ? formatSNR(latest.snr) : "-- dB"}
              </p>
            </div>
          </div>

          {/* Abas de Navegação */}
          <div className="flex gap-2 border-t border-blue-500 pt-4 flex-wrap">
            {MENU_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-6 py-2 rounded-lg font-semibold transition ${
                  activeTab === item.id
                    ? "bg-white text-blue-600"
                    : "bg-blue-700 text-white hover:bg-blue-600"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Status */}
          {lastUpdate && (
            <p className="text-xs text-blue-100 mt-4">
              Última atualização: {formatTime(lastUpdate)}
            </p>
          )}
        </div>
      </header>

      {/* ===========================
          CONTEÚDO PRINCIPAL
         =========================== */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading && !latest ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-4 text-gray-600">Carregando dados...</span>
          </div>
        ) : (
          <>
            {/* ===========================
                ABA 1: DADOS DO SENSOR
               =========================== */}
            {activeTab === "sensor" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
                {/* Card Estatísticas */}
                <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition dark:bg-slate-800">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    Estatísticas (24h)
                  </h2>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Temperatura */}
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 p-4 rounded-lg">
                      <p className="text-xs text-blue-600 dark:text-blue-300 uppercase font-semibold tracking-wider">
                        Máx. Temp
                      </p>
                      <p className="text-2xl font-bold text-blue-800 dark:text-blue-100 mt-1">
                        {statistics?.temperature?.max
                          ? formatTemperature(statistics.temperature.max)
                          : "--°C"}
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 p-4 rounded-lg">
                      <p className="text-xs text-blue-600 dark:text-blue-300 uppercase font-semibold tracking-wider">
                        Mín. Temp
                      </p>
                      <p className="text-2xl font-bold text-blue-800 dark:text-blue-100 mt-1">
                        {statistics?.temperature?.min
                          ? formatTemperature(statistics.temperature.min)
                          : "--°C"}
                      </p>
                    </div>

                    {/* Umidade */}
                    <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 p-4 rounded-lg">
                      <p className="text-xs text-green-600 dark:text-green-300 uppercase font-semibold tracking-wider">
                        Máx. Umidade
                      </p>
                      <p className="text-2xl font-bold text-green-800 dark:text-green-100 mt-1">
                        {statistics?.humidity?.max
                          ? formatHumidity(statistics.humidity.max)
                          : "--%"}
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 p-4 rounded-lg">
                      <p className="text-xs text-green-600 dark:text-green-300 uppercase font-semibold tracking-wider">
                        Mín. Umidade
                      </p>
                      <p className="text-2xl font-bold text-green-800 dark:text-green-100 mt-1">
                        {statistics?.humidity?.min
                          ? formatHumidity(statistics.humidity.min)
                          : "--%"}
                      </p>
                    </div>

                    {/* Médias */}
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 p-4 rounded-lg col-span-2">
                      <p className="text-xs text-purple-600 dark:text-purple-300 uppercase font-semibold tracking-wider">
                        Média Temp / Umidade
                      </p>
                      <p className="text-xl font-bold text-purple-800 dark:text-purple-100 mt-1">
                        {statistics?.temperature?.avg
                          ? `${formatTemperature(
                              statistics.temperature.avg,
                            )} / ${formatHumidity(statistics.humidity.avg)}`
                          : "--°C / --%"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Gráficos */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition dark:bg-slate-800">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
                    Histórico (Últimas 24h)
                  </h2>

                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={readings}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        dataKey="timestamp"
                        tick={{ fontSize: 12 }}
                        stroke="#94a3b8"
                      />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="temperature"
                        stroke="#3b82f6"
                        name="Temperatura (°C)"
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="humidity"
                        stroke="#10b981"
                        name="Umidade (%)"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Card Leituras Recentes */}
                <div className="lg:col-span-3 bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition dark:bg-slate-800">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                      Leituras Recentes
                    </h2>
                    <button
                      onClick={() => setShowDetails(!showDetails)}
                      className="text-blue-600 hover:text-blue-700 transition"
                    >
                      {showDetails ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 dark:bg-slate-700 border-b-2 border-gray-200 dark:border-slate-600">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                            Horário
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                            Temperatura
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                            Umidade
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                            RSSI
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                            SNR
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                        {readings.slice(0, 10).map((reading, idx) => (
                          <tr
                            key={idx}
                            className="hover:bg-gray-50 dark:hover:bg-slate-700 transition cursor-pointer"
                            onClick={() => setSelectedReading(reading)}
                          >
                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                              {reading.timestamp}
                            </td>
                            <td className="px-4 py-3 font-semibold text-blue-600 dark:text-blue-400">
                              {formatTemperature(reading.temperature)}
                            </td>
                            <td className="px-4 py-3 font-semibold text-green-600 dark:text-green-400">
                              {formatHumidity(reading.humidity)}
                            </td>
                            <td className="px-4 py-3 font-semibold text-purple-600 dark:text-purple-400">
                              {formatRSSI(reading.rssi)}
                            </td>
                            <td className="px-4 py-3 font-semibold text-orange-600 dark:text-orange-400">
                              {formatSNR(reading.snr)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {readings.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p>Nenhuma leitura disponível</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ===========================
                ABA 2: QUALIDADE DO SINAL
               =========================== */}
            {activeTab === "rssi" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
                {/* Card Qualidade */}
                <SignalQualityCard quality={quality} statistics={statistics} />

                {/* Card Gráficos RSSI */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition dark:bg-slate-800">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
                    Histórico RSSI e SNR
                  </h2>

                  <div className="space-y-8">
                    {/* Gráfico RSSI */}
                    <div>
                      <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-400 mb-4">
                        RSSI (dBm)
                      </h3>
                      <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={readings}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#e2e8f0"
                          />
                          <XAxis
                            dataKey="timestamp"
                            tick={{ fontSize: 12 }}
                            stroke="#94a3b8"
                          />
                          <YAxis stroke="#94a3b8" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#f8fafc",
                              border: "1px solid #e2e8f0",
                              borderRadius: "8px",
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="rssi"
                            stroke="#a855f7"
                            fill="#e9d5ff"
                            name="RSSI (dBm)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Gráfico SNR */}
                    <div>
                      <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-400 mb-4">
                        SNR (dB)
                      </h3>
                      <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={readings}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#e2e8f0"
                          />
                          <XAxis
                            dataKey="timestamp"
                            tick={{ fontSize: 12 }}
                            stroke="#94a3b8"
                          />
                          <YAxis stroke="#94a3b8" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#f8fafc",
                              border: "1px solid #e2e8f0",
                              borderRadius: "8px",
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="snr"
                            stroke="#3b82f6"
                            fill="#dbeafe"
                            name="SNR (dB)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* ===========================
          FOOTER
         =========================== */}
      <footer className="bg-gray-800 dark:bg-slate-900 text-gray-300 text-center py-6 mt-12">
        <p className="text-sm">
          MoT Dashboard • Monitoramento LoRaWAN • Última atualização:{" "}
          {lastUpdate ? formatTime(lastUpdate) : "--:--:--"}
        </p>
        <p className="text-xs text-gray-500 mt-2">
          © 2025 Metodologia TpM - Unicamp • Dispositivo: {DEVICE_ID}
        </p>
      </footer>
    </div>
  );
}
