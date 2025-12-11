// debug.h

#ifndef DEBUG_H
#define DEBUG_H
// =======================================================================
// SISTEMA DE LOGS E DEBUG
// =======================================================================
//
// Este módulo implementa logs com níveis (INFO, WARN, ERROR, DEBUG)
// e suporte para categorias (geral, LoRa, sensor, etc.).
//
// Para desabilitar logs completamente, defina DEBUG_ENABLED como 0
// =======================================================================

// Habilita ou desabilita logs globais
#define DEBUG_ENABLED 1

// Define o nível mínimo de log a ser exibido
// 0 = ERROR, 1 = WARN, 2 = INFO, 3 = DEBUG
#define LOG_LEVEL 3

// =======================================================================
// FUNÇÕES INTERNAS
// =======================================================================

// Ccontrole de nível
#define LOG_ERROR(msg)   if(LOG_LEVEL>=0 && DEBUG_ENABLED){Serial.println("[ERROR] "+String(msg));}
#define LOG_WARN(msg)    if(LOG_LEVEL>=1 && DEBUG_ENABLED){Serial.println("[WARN] "+String(msg));}
#define LOG_INFO(msg)    if(LOG_LEVEL>=2 && DEBUG_ENABLED){Serial.println("[INFO] "+String(msg));}
#define LOG_DEBUG(msg)   if(LOG_LEVEL>=3 && DEBUG_ENABLED){Serial.println("[DEBUG] "+String(msg));}

#endif
