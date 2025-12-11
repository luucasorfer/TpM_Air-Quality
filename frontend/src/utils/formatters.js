/**
 * formatters.js
 * Funções utilitárias para formatação de dados
 */

/**
 * Formatar temperatura com unidade
 * @param {number} celsius - Temperatura em Celsius
 * @param {number} decimals - Número de casas decimais
 * @returns {string} - Temperatura formatada
 */
export function formatTemperature(celsius, decimals = 2) {
  if (celsius === null || celsius === undefined) return "--°C";
  return `${parseFloat(celsius).toFixed(decimals)}°C`;
}

/**
 * Formatar umidade com unidade
 * @param {number} humidity - Umidade em percentual
 * @param {number} decimals - Número de casas decimais
 * @returns {string} - Umidade formatada
 */
export function formatHumidity(humidity, decimals = 2) {
  if (humidity === null || humidity === undefined) return "--%";
  return `${parseFloat(humidity).toFixed(decimals)}%`;
}

/**
 * Formatar RSSI (Received Signal Strength Indicator)
 * @param {number} rssi - RSSI em dBm
 * @returns {string} - RSSI formatado
 */
export function formatRSSI(rssi) {
  if (rssi === null || rssi === undefined) return "-- dBm";
  return `${rssi} dBm`;
}

/**
 * Formatar SNR (Signal-to-Noise Ratio)
 * @param {number} snr - SNR em dB
 * @param {number} decimals - Número de casas decimais
 * @returns {string} - SNR formatado
 */
export function formatSNR(snr, decimals = 1) {
  if (snr === null || snr === undefined) return "-- dB";
  return `${parseFloat(snr).toFixed(decimals)} dB`;
}

/**
 * Formatar timestamp para hora local
 * @param {string|Date} timestamp - Timestamp ISO ou Date
 * @param {string} locale - Localização (pt-BR por padrão)
 * @returns {string} - Hora formatada
 */
export function formatTime(timestamp, locale = "pt-BR") {
  if (!timestamp) return "--:--:--";

  try {
    const date = new Date(timestamp);
    return date.toLocaleTimeString(locale, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch (error) {
    console.error("Erro ao formatar hora:", error);
    return "--:--:--";
  }
}

/**
 * Formatar data completa
 * @param {string|Date} timestamp - Timestamp ISO ou Date
 * @param {string} locale - Localização (pt-BR por padrão)
 * @returns {string} - Data formatada
 */
export function formatDate(timestamp, locale = "pt-BR") {
  if (!timestamp) return "--/--/----";

  try {
    const date = new Date(timestamp);
    return date.toLocaleDateString(locale, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch (error) {
    console.error("Erro ao formatar data:", error);
    return "--/--/----";
  }
}

/**
 * Formatar data e hora
 * @param {string|Date} timestamp - Timestamp ISO ou Date
 * @param {string} locale - Localização (pt-BR por padrão)
 * @returns {string} - Data e hora formatadas
 */
export function formatDateTime(timestamp, locale = "pt-BR") {
  if (!timestamp) return "-- -- --";

  try {
    const date = new Date(timestamp);
    const dateStr = date.toLocaleDateString(locale);
    const timeStr = date.toLocaleTimeString(locale);
    return `${dateStr} ${timeStr}`;
  } catch (error) {
    console.error("Erro ao formatar data/hora:", error);
    return "-- -- --";
  }
}

/**
 * Formatar número com separador de milhares
 * @param {number} value - Valor a formatar
 * @param {number} decimals - Número de casas decimais
 * @returns {string} - Número formatado
 */
export function formatNumber(value, decimals = 0) {
  if (value === null || value === undefined) return "--";

  return parseFloat(value).toLocaleString("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Formatar duração em segundos para formato legível
 * @param {number} seconds - Duração em segundos
 * @returns {string} - Duração formatada
 */
export function formatDuration(seconds) {
  if (!seconds || seconds < 0) return "0s";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}

/**
 * Formatar tamanho de arquivo
 * @param {number} bytes - Tamanho em bytes
 * @returns {string} - Tamanho formatado
 */
export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Formatar percentual
 * @param {number} value - Valor (0-100)
 * @param {number} decimals - Número de casas decimais
 * @returns {string} - Percentual formatado
 */
export function formatPercent(value, decimals = 1) {
  if (value === null || value === undefined) return "--%";
  return `${parseFloat(value).toFixed(decimals)}%`;
}

/**
 * Obter descrição de qualidade do sinal baseado em RSSI
 * @param {number} rssi - RSSI em dBm
 * @returns {object} - { label, color, description }
 */
export function getSignalQualityDescription(rssi) {
  if (rssi > -80) {
    return {
      label: "Excelente",
      color: "green",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
      description: "Sinal muito forte e estável",
    };
  }
  if (rssi > -90) {
    return {
      label: "Bom",
      color: "blue",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      description: "Sinal forte e confiável",
    };
  }
  if (rssi > -100) {
    return {
      label: "Aceitável",
      color: "yellow",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-600",
      description: "Sinal presente mas pode melhorar",
    };
  }
  if (rssi > -110) {
    return {
      label: "Fraco",
      color: "orange",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600",
      description: "Sinal fraco, considere reposicionar",
    };
  }
  return {
    label: "Muito Fraco",
    color: "red",
    bgColor: "bg-red-50",
    textColor: "text-red-600",
    description: "Sinal muito fraco, reposicione o gateway",
  };
}

/**
 * Formatar valor com unidade genérica
 * @param {number} value - Valor
 * @param {string} unit - Unidade
 * @param {number} decimals - Número de casas decimais
 * @returns {string} - Valor formatado
 */
export function formatValue(value, unit = "", decimals = 2) {
  if (value === null || value === undefined) return `-- ${unit}`;
  return `${parseFloat(value).toFixed(decimals)} ${unit}`.trim();
}

/**
 * Truncar texto com reticências
 * @param {string} text - Texto a truncar
 * @param {number} maxLength - Comprimento máximo
 * @returns {string} - Texto truncado
 */
export function truncateText(text, maxLength = 50) {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

/**
 * Capitalizar primeira letra
 * @param {string} text - Texto
 * @returns {string} - Texto capitalizado
 */
export function capitalize(text) {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Converter camelCase para espaços
 * @param {string} text - Texto em camelCase
 * @returns {string} - Texto com espaços
 */
export function camelCaseToSpaces(text) {
  if (!text) return "";
  return text
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

/**
 * Formatar objeto para exibição
 * @param {object} obj - Objeto
 * @returns {string} - Objeto formatado
 */
export function formatObject(obj) {
  return JSON.stringify(obj, null, 2);
}

/**
 * Formatar array de dados para tabela
 * @param {array} data - Array de dados
 * @returns {array} - Dados formatados
 */
export function formatTableData(data) {
  if (!Array.isArray(data)) return [];

  return data.map((row) => {
    const formatted = {};

    Object.keys(row).forEach((key) => {
      const value = row[key];

      // Formatar baseado no tipo de chave
      if (key.includes("temperature")) {
        formatted[key] = formatTemperature(value);
      } else if (key.includes("humidity")) {
        formatted[key] = formatHumidity(value);
      } else if (key.includes("rssi")) {
        formatted[key] = formatRSSI(value);
      } else if (key.includes("snr")) {
        formatted[key] = formatSNR(value);
      } else if (
        key.includes("time") ||
        key.includes("date") ||
        key.includes("at")
      ) {
        formatted[key] = formatDateTime(value);
      } else {
        formatted[key] = value;
      }
    });

    return formatted;
  });
}
