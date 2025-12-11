// config.h

#ifndef CONFIG_H
#define CONFIG_H

#include <Arduino.h>

// =======================================================================
// CONFIGURAÇÕES GERAIS
// =======================================================================

#define DEBUG_SERIAL_BAUD 115200
#define INTERVALO_ENVIO_MS 120000  // 2 minuto

// =======================================================================
// SENSOR DHT22
// =======================================================================

#define DHT_PIN D4       // GPIO2

// =======================================================================
// MÓDULO LORA
// =======================================================================

#define LORA_RX 13       // D7
#define LORA_TX 15       // D8

// =======================================================================
// CREDENCIAIS TTN (ABP)
// =======================================================================

extern const char* DEVADDR;
extern const char* APPSKEY;
extern const char* NWKSKEY;
extern const char* CHMASK;

#endif
