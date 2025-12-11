// payloadBuilder.cpp

#include "payloadBuilder.h"
#include <Arduino.h>

// Tamanho mínimo do payload MoT para os dados solicitados (até o byte 24)
// O tamanho é definido em payloadBuilder.h como MOT_PAYLOAD_SIZE (25)

void PayloadBuilder::buildPayload(float temperature, float humidity, uint8_t* payload, uint8_t packet_counter) {
    // Inicializa o array com zeros.
    // O array 'payload' deve ter sido alocado com tamanho suficiente (MOT_PAYLOAD_SIZE) antes de chamar esta função.
    for (int i = 0; i < MOT_PAYLOAD_SIZE; i++) {
        payload[i] = 0x00;
    }

    // 1. Processamento dos dados para inteiro de 16 bits (multiplicar por 100)
    // O tipo 'uint16_t' garante 2 bytes (16 bits) e permite valores negativos, embora não esperados para DHT22.
    uint16_t temp_int = (uint16_t)(temperature * 100);
    uint16_t hum_int = (uint16_t)(humidity * 100);

    // --- Mapeamento dos Campos Solicitados (MoT) ---

    // Camada RED
    payload[8] = 50; // End Dest (0x32)
    // payload[9] = 0; // Rede Dest (Já é 0x00 pela inicialização)
    payload[10] = 1; // End Orig (0x01)
    // payload[11] = 0; // Rede Orig (Já é 0x00 pela inicialização)

    // Camada TRANSP
    payload[12] = packet_counter; // Cont PCK up

    // Camada APP up (Dados de Telemetria)
    
    // Temperatura (Bytes 20 e 21) - Big Endian (MSB primeiro, depois LSB)
    payload[20] = (uint8_t)(temp_int >> 8);   // Byte Mais Significativo (MSB)
    payload[21] = (uint8_t)(temp_int & 0xFF); // Byte Menos Significativo (LSB)

    // Umidade (Bytes 23 e 24) - Big Endian
    // payload[22] = 0; // ADC2 (Byte 1) (Já é 0x00 pela inicialização)
    payload[23] = (uint8_t)(hum_int >> 8);    // Byte Mais Significativo (MSB)
    payload[24] = (uint8_t)(hum_int & 0xFF);  // Byte Menos Significativo (LSB)
}
