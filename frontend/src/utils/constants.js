/**
 * constants.js
 * Constantes e configurações do projeto MoT Dashboard
 */

// ===========================
// API CONFIGURATION
// ===========================

// Detectar ambiente
const isDevelopment = import.meta.env.DEV;

export const API_CONFIG = {
  // Em desenvolvimento, usar proxy local; em produção, usar URL completa
  BASE_URL: isDevelopment
    ? "http://localhost:3000" // Proxy local
    : import.meta.env.VITE_API_URL || "https://ttn-webhook-server.onrender.com",

  DEVICE_ID: import.meta.env.VITE_DEVICE_ID || "meu-end-device-teste",
  TIMEOUT: 10000, // 10 segundos
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 segundo
};

// ===========================
// API ENDPOINTS
// ===========================

export const API_ENDPOINTS = {
  HEALTH: "/health",
  SENSOR_LATEST: "/api/sensor/latest",
  SENSOR_READINGS: "/api/sensor/readings",
  SENSOR_STATISTICS: "/api/sensor/statistics",
  SENSOR_QUALITY: "/api/sensor/quality",
  WEBHOOK: "/ttn",
};

// ===========================
// REFRESH INTERVALS
// ===========================

export const REFRESH_INTERVALS = {
  FAST: 5000, // 5 segundos
  NORMAL: 30000, // 30 segundos
  SLOW: 60000, // 1 minuto
  VERY_SLOW: 300000, // 5 minutos
};

// ===========================
// CHART PERIODS
// ===========================

export const CHART_PERIODS = {
  "1h": "1 hora",
  "6h": "6 horas",
  "24h": "24 horas",
  "7d": "7 dias",
  "30d": "30 dias",
};

// ===========================
// SIGNAL QUALITY THRESHOLDS
// ===========================

export const SIGNAL_QUALITY = {
  EXCELLENT: { min: -80, label: "Excelente", color: "green" },
  GOOD: { min: -90, label: "Bom", color: "blue" },
  ACCEPTABLE: { min: -100, label: "Aceitável", color: "yellow" },
  WEAK: { min: -110, label: "Fraco", color: "orange" },
  VERY_WEAK: { min: -120, label: "Muito Fraco", color: "red" },
};

// ===========================
// TEMPERATURE RANGES
// ===========================

export const TEMPERATURE_RANGES = {
  MIN: -40,
  MAX: 80,
  COMFORTABLE_MIN: 18,
  COMFORTABLE_MAX: 26,
  WARNING_MIN: 10,
  WARNING_MAX: 35,
  CRITICAL_MIN: 0,
  CRITICAL_MAX: 50,
};

// ===========================
// HUMIDITY RANGES
// ===========================

export const HUMIDITY_RANGES = {
  MIN: 0,
  MAX: 100,
  COMFORTABLE_MIN: 40,
  COMFORTABLE_MAX: 60,
  WARNING_MIN: 30,
  WARNING_MAX: 70,
  CRITICAL_MIN: 20,
  CRITICAL_MAX: 80,
};

// ===========================
// CHART COLORS
// ===========================

export const CHART_COLORS = {
  TEMPERATURE: "#3b82f6", // Blue
  HUMIDITY: "#10b981", // Green
  RSSI: "#a855f7", // Purple
  SNR: "#f59e0b", // Amber
  AVERAGE: "#6366f1", // Indigo
  MIN: "#ef4444", // Red
  MAX: "#22c55e", // Green
};

// ===========================
// UI COLORS
// ===========================

export const UI_COLORS = {
  PRIMARY: "#3b82f6",
  SECONDARY: "#10b981",
  SUCCESS: "#22c55e",
  WARNING: "#f59e0b",
  ERROR: "#ef4444",
  INFO: "#06b6d4",
  LIGHT: "#f3f4f6",
  DARK: "#1f2937",
};

// ===========================
// TOAST MESSAGES
// ===========================

export const TOAST_MESSAGES = {
  SUCCESS: {
    LOAD_DATA: "Dados carregados com sucesso",
    REFRESH_DATA: "Dados atualizados",
    EXPORT_DATA: "Dados exportados com sucesso",
  },
  ERROR: {
    LOAD_DATA: "Erro ao carregar dados",
    NETWORK: "Erro de conexão com o servidor",
    INVALID_DATA: "Dados inválidos recebidos",
    TIMEOUT: "Tempo limite de requisição excedido",
  },
  WARNING: {
    SIGNAL_WEAK: "Sinal fraco detectado",
    PACKET_LOSS: "Perda de pacotes detectada",
    HIGH_VARIATION: "Variação alta de RSSI",
  },
};

// ===========================
// LOCAL STORAGE KEYS
// ===========================

export const STORAGE_KEYS = {
  PREFERENCES: "mot_preferences",
  CACHE_LATEST: "mot_cache_latest",
  CACHE_READINGS: "mot_cache_readings",
  CACHE_STATISTICS: "mot_cache_statistics",
  CACHE_QUALITY: "mot_cache_quality",
  HISTORY: "mot_history",
  ALERTS: "mot_alerts",
};

// ===========================
// PAGINATION
// ===========================

export const PAGINATION = {
  DEFAULT_LIMIT: 100,
  MAX_LIMIT: 1000,
  PAGE_SIZES: [10, 25, 50, 100],
};

// ===========================
// FORMATS
// ===========================

export const FORMATS = {
  DATE: "DD/MM/YYYY",
  TIME: "HH:mm:ss",
  DATETIME: "DD/MM/YYYY HH:mm:ss",
  TEMPERATURE: "0.00°C",
  HUMIDITY: "0.00%",
  RSSI: "0 dBm",
  SNR: "0.0 dB",
};

// ===========================
// DEVICE CONFIGURATION
// ===========================

export const DEVICE_CONFIG = {
  DEVICE_ID: import.meta.env.VITE_DEVICE_ID || "meu-end-device-teste",
  DEVICE_NAME: "MoT Sensor DHT22",
  DEVICE_TYPE: "LoRaWAN",
  DEVICE_LOCATION: "Residencial",
  SENSOR_TYPE: "DHT22",
  TRANSMISSION_INTERVAL: 120000, // 2 minutos em ms
};

// ===========================
// FEATURE FLAGS
// ===========================

export const FEATURES = {
  REAL_TIME_UPDATES: true,
  WEBSOCKET_ENABLED: false,
  DARK_MODE: true,
  NOTIFICATIONS: true,
  EXPORT_CSV: true,
  EXPORT_PDF: true,
  ALERTS: true,
  MULTI_DEVICE: false,
};

// ===========================
// NOTIFICATIONS
// ===========================

export const NOTIFICATIONS = {
  TYPES: {
    SUCCESS: "success",
    ERROR: "error",
    WARNING: "warning",
    INFO: "info",
  },
  DURATIONS: {
    SHORT: 3000,
    NORMAL: 5000,
    LONG: 8000,
    PERSISTENT: 0,
  },
};

// ===========================
// EXPORT FORMATS
// ===========================

export const EXPORT_FORMATS = {
  CSV: "csv",
  JSON: "json",
  PDF: "pdf",
  XLSX: "xlsx",
};

// ===========================
// UNITS
// ===========================

export const UNITS = {
  TEMPERATURE: "°C",
  HUMIDITY: "%",
  RSSI: "dBm",
  SNR: "dB",
  FREQUENCY: "MHz",
  BANDWIDTH: "kHz",
};

// ===========================
// LOCALIZATION
// ===========================

export const LOCALE = {
  LANGUAGE: "pt-BR",
  TIMEZONE: "America/Sao_Paulo",
  DATE_FORMAT: "DD/MM/YYYY",
  TIME_FORMAT: "HH:mm:ss",
};

// ===========================
// VALIDATION RULES
// ===========================

export const VALIDATION = {
  DEVICE_ID: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-Z0-9-_]+$/,
  },
  TEMPERATURE: {
    MIN: -40,
    MAX: 80,
  },
  HUMIDITY: {
    MIN: 0,
    MAX: 100,
  },
  RSSI: {
    MIN: -120,
    MAX: 0,
  },
  SNR: {
    MIN: -20,
    MAX: 20,
  },
};

// ===========================
// DEFAULT VALUES
// ===========================

export const DEFAULTS = {
  REFRESH_INTERVAL: REFRESH_INTERVALS.NORMAL,
  CHART_PERIOD: "24h",
  PAGE_SIZE: PAGINATION.DEFAULT_LIMIT,
  THEME: "light",
  LANGUAGE: "pt-BR",
  TIMEZONE: "America/Sao_Paulo",
};

// ===========================
// ERROR CODES
// ===========================

export const ERROR_CODES = {
  NETWORK_ERROR: "NETWORK_ERROR",
  TIMEOUT: "TIMEOUT",
  INVALID_DATA: "INVALID_DATA",
  NOT_FOUND: "NOT_FOUND",
  UNAUTHORIZED: "UNAUTHORIZED",
  SERVER_ERROR: "SERVER_ERROR",
  UNKNOWN: "UNKNOWN",
};

// ===========================
// HTTP STATUS CODES
// ===========================

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

// ===========================
// CACHE TTL (Time To Live)
// ===========================

export const CACHE_TTL = {
  LATEST: 10000, // 10 segundos
  READINGS: 30000, // 30 segundos
  STATISTICS: 60000, // 1 minuto
  QUALITY: 60000, // 1 minuto
};

// ===========================
// MENU ITEMS
// ===========================

export const MENU_ITEMS = [
  {
    id: "sensor",
    label: "Dados do Sensor",
    icon: "BarChart3",
    description: "Temperatura, Umidade e Histórico",
  },
  {
    id: "rssi",
    label: "Análise de Sinal",
    icon: "Wifi",
    description: "RSSI, SNR e Análise de Sinal",
  },
];

// ===========================
// HELP TEXTS
// ===========================

export const HELP_TEXTS = {
  RSSI: "Indicador de Força do Sinal Recebido (em dBm). Valores próximos a 0 são melhores.",
  SNR: "Relação Sinal-Ruído (em dB). Valores acima de 5 dB são ideais.",
  TEMPERATURE: "Temperatura ambiente em graus Celsius.",
  HUMIDITY: "Umidade relativa do ar em percentual.",
  PACKET_LOSS: "Percentual de pacotes perdidos na transmissão.",
  SIGNAL_QUALITY: "Qualidade geral do sinal baseada em RSSI e SNR.",
};

// ===========================
// VERSION
// ===========================

export const APP_VERSION = "1.0.0";
export const APP_NAME = "MoT Dashboard";
export const APP_DESCRIPTION =
  "Dashboard para Monitoramento de Temperatura e Umidade via LoRaWAN";
