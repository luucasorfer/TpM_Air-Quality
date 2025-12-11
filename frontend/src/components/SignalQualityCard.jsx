/**
 * SignalQualityCard.jsx
 * Componente para exibir análise detalhada de qualidade do sinal RSSI/SNR
 */

import React from "react";
import {
  AlertCircle,
  CheckCircle,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

export function SignalQualityCard({ quality, statistics }) {
  if (!quality) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <p className="text-gray-500">Carregando análise de qualidade...</p>
      </div>
    );
  }

  /**
   * Determinar qualidade baseado em RSSI
   */
  const getQualityLevel = (rssi) => {
    if (rssi > -80) {
      return {
        label: "Excelente",
        color: "text-green-600",
        bg: "bg-green-50",
        icon: CheckCircle,
        description: "Sinal muito forte e estável",
      };
    }
    if (rssi > -90) {
      return {
        label: "Bom",
        color: "text-blue-600",
        bg: "bg-blue-50",
        icon: CheckCircle,
        description: "Sinal forte e confiável",
      };
    }
    if (rssi > -100) {
      return {
        label: "Aceitável",
        color: "text-yellow-600",
        bg: "bg-yellow-50",
        icon: AlertCircle,
        description: "Sinal presente mas pode melhorar",
      };
    }
    if (rssi > -110) {
      return {
        label: "Fraco",
        color: "text-orange-600",
        bg: "bg-orange-50",
        icon: AlertCircle,
        description: "Sinal fraco, considere reposicionar",
      };
    }
    return {
      label: "Muito Fraco",
      color: "text-red-600",
      bg: "bg-red-50",
      icon: AlertCircle,
      description: "Sinal muito fraco, reposicione o gateway",
    };
  };

  const qualityLevel = getQualityLevel(quality.avg_rssi);
  const QualityIcon = qualityLevel.icon;

  /**
   * Calcular taxa de sucesso
   */
  const successRate = quality.readings_analyzed > 0 ? 100 : 0;

  /**
   * Calcular variação RSSI
   */
  const rssiVariation =
    quality.rssi_range?.max && quality.rssi_range?.min
      ? Math.abs(quality.rssi_range.max - quality.rssi_range.min)
      : 0;

  /**
   * Gerar recomendações
   */
  const getRecommendations = () => {
    const recommendations = [];

    if (quality.avg_rssi < -90) {
      recommendations.push({
        type: "warning",
        text: "Considere reposicionar o gateway para melhor cobertura",
      });
    }

    if (rssiVariation > 20) {
      recommendations.push({
        type: "warning",
        text: "Variação alta de RSSI indica instabilidade do sinal",
      });
    }

    if (statistics?.snr?.avg > 10) {
      recommendations.push({
        type: "success",
        text: "Excelente relação sinal-ruído",
      });
    }

    if (quality.readings_analyzed > 100) {
      recommendations.push({
        type: "success",
        text: "Quantidade suficiente de dados para análise confiável",
      });
    }

    if (quality.avg_rssi > -80 && statistics?.snr?.avg > 5) {
      recommendations.push({
        type: "success",
        text: "Sistema operando em condições ideais",
      });
    }

    return recommendations;
  };

  const recommendations = getRecommendations();

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
      <h2 className="text-xl font-bold text-gray-800 mb-6">
        Análise de Qualidade do Sinal
      </h2>

      {/* Status Geral */}
      <div
        className={`${qualityLevel.bg} p-6 rounded-lg mb-6 border-l-4 ${qualityLevel.color}`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p
              className={`text-sm ${qualityLevel.color} uppercase font-semibold tracking-wider`}
            >
              Qualidade Geral
            </p>
            <p className={`text-3xl font-bold ${qualityLevel.color} mt-2`}>
              {qualityLevel.label}
            </p>
            <p className={`text-sm ${qualityLevel.color} opacity-80 mt-2`}>
              {qualityLevel.description}
            </p>
          </div>
          <QualityIcon
            className={`w-12 h-12 ${qualityLevel.color} opacity-50`}
          />
        </div>
      </div>

      {/* Grid de Métricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Pacotes Analisados */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-xs text-blue-600 uppercase font-semibold">
            Pacotes
          </p>
          <p className="text-2xl font-bold text-blue-800 mt-2">
            {quality.readings_analyzed || 0}
          </p>
        </div>

        {/* Taxa de Sucesso */}
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-xs text-green-600 uppercase font-semibold">
            Sucesso
          </p>
          <p className="text-2xl font-bold text-green-800 mt-2">
            {successRate}%
          </p>
        </div>

        {/* Variação RSSI */}
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-xs text-purple-600 uppercase font-semibold">
            Variação
          </p>
          <p className="text-2xl font-bold text-purple-800 mt-2">
            {rssiVariation} dBm
          </p>
        </div>

        {/* SNR Médio */}
        <div className="bg-orange-50 p-4 rounded-lg">
          <p className="text-xs text-orange-600 uppercase font-semibold">
            SNR Médio
          </p>
          <p className="text-2xl font-bold text-orange-800 mt-2">
            {statistics?.snr?.avg
              ? `${statistics.snr.avg.toFixed(1)} dB`
              : "-- dB"}
          </p>
        </div>
      </div>

      {/* Detalhes RSSI */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-4">Detalhes RSSI</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-gray-600 uppercase font-semibold">
              Mínimo
            </p>
            <p className="text-xl font-bold text-red-600 mt-1">
              {quality.rssi_range?.min || "--"} dBm
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 uppercase font-semibold">
              Médio
            </p>
            <p className="text-xl font-bold text-blue-600 mt-1">
              {quality.avg_rssi || "--"} dBm
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 uppercase font-semibold">
              Máximo
            </p>
            <p className="text-xl font-bold text-green-600 mt-1">
              {quality.rssi_range?.max || "--"} dBm
            </p>
          </div>
        </div>
      </div>

      {/* Barra de Qualidade Visual */}
      <div className="mb-6">
        <p className="text-sm font-semibold text-gray-700 mb-2">
          Indicador de Força do Sinal
        </p>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full transition-all ${
              quality.avg_rssi > -80
                ? "bg-green-500"
                : quality.avg_rssi > -90
                ? "bg-blue-500"
                : quality.avg_rssi > -100
                ? "bg-yellow-500"
                : quality.avg_rssi > -110
                ? "bg-orange-500"
                : "bg-red-500"
            }`}
            style={{
              width: `${Math.max(
                0,
                Math.min(100, ((quality.avg_rssi + 120) / 40) * 100),
              )}%`,
            }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {quality.avg_rssi > -80
            ? "Excelente"
            : quality.avg_rssi > -90
            ? "Bom"
            : quality.avg_rssi > -100
            ? "Aceitável"
            : quality.avg_rssi > -110
            ? "Fraco"
            : "Muito Fraco"}
        </p>
      </div>

      {/* Recomendações */}
      {recommendations.length > 0 && (
        <div className="border-t pt-6">
          <h3 className="font-semibold text-gray-800 mb-4">💡 Recomendações</h3>
          <div className="space-y-3">
            {recommendations.map((rec, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg flex items-start gap-3 ${
                  rec.type === "success"
                    ? "bg-green-50 border-l-4 border-green-500"
                    : "bg-yellow-50 border-l-4 border-yellow-500"
                }`}
              >
                <div
                  className={`mt-0.5 ${
                    rec.type === "success"
                      ? "text-green-600"
                      : "text-yellow-600"
                  }`}
                >
                  {rec.type === "success" ? "✓" : "⚠"}
                </div>
                <p
                  className={`text-sm ${
                    rec.type === "success"
                      ? "text-green-700"
                      : "text-yellow-700"
                  }`}
                >
                  {rec.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Informação Técnica */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg text-xs text-gray-600">
        <p className="font-semibold mb-2">ℹ️ Informação Técnica</p>
        <ul className="space-y-1">
          <li>• RSSI: Indicador de Força do Sinal Recebido (em dBm)</li>
          <li>• SNR: Relação Sinal-Ruído (em dB)</li>
          <li>• Melhor RSSI: valores próximos a 0 (ex: -30 dBm)</li>
          <li>• Pior RSSI: valores muito negativos (ex: -120 dBm)</li>
          <li>• SNR ideal: acima de 5 dB</li>
        </ul>
      </div>
    </div>
  );
}
