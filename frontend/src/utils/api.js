const API_BASE_URL =
  process.env.VITE_API_URL || "https://ttn-webhook-server.onrender.com";

export async function fetchLatest(deviceId) {
  const response = await fetch(
    `${API_BASE_URL}/api/sensor/latest?device_id=${deviceId}`,
  );
  if (!response.ok) throw new Error("Erro ao buscar última leitura");
  return response.json();
}

export async function fetchReadings(deviceId, limit = 100) {
  const response = await fetch(
    `${API_BASE_URL}/api/sensor/readings?device_id=${deviceId}&limit=${limit}`,
  );
  if (!response.ok) throw new Error("Erro ao buscar leituras");
  return response.json();
}

export async function fetchStatistics(deviceId, period = "24h") {
  const response = await fetch(
    `${API_BASE_URL}/api/sensor/statistics?device_id=${deviceId}&period=${period}`,
  );
  if (!response.ok) throw new Error("Erro ao buscar estatísticas");
  return response.json();
}

export async function fetchQuality(deviceId, limit = 100) {
  const response = await fetch(
    `${API_BASE_URL}/api/sensor/quality?device_id=${deviceId}&limit=${limit}`,
  );
  if (!response.ok) throw new Error("Erro ao buscar qualidade");
  return response.json();
}
