#include <Arduino.h>
#include <SoftwareSerial.h>

// =======================================================================
// CONFIGURAÇÕES DOS PINOS
// =======================================================================

// RX do ESP8266 (recebe dados do TX do LoRa)
#define LORA_RX 13  // D7 no NodeMCU

// TX do ESP8266 (envia dados para RX do LoRa)
#define LORA_TX 15  // D8 no NodeMCU

// Inicializa a porta serial via software
SoftwareSerial LoRaSerial(LORA_RX, LORA_TX);

// =======================================================================
// CREDENCIAIS TTN (ABP)
// =======================================================================
const char* DEVADDR = "26:0D:43:45";
const char* APPSKEY = "D9:B2:0A:74:27:CF:C2:A4:4C:42:8C:E6:9D:5D:97:C7";
const char* NWKSKEY = "AB:DE:71:8B:0D:AC:8F:0B:17:87:BE:0B:76:68:54:BE";

// =======================================================================
// FUNÇÃO DE ENVIO DE COMANDOS AT
// =======================================================================
void enviaComandoLoRa(const String& comando, unsigned long timeout = 3000) {
  while (LoRaSerial.available()) LoRaSerial.read();
  LoRaSerial.print(comando + "\r\n");

  Serial.print("[COMANDO - ESP8266] -> ");
  Serial.println(comando);

  unsigned long start = millis();
  String resposta = "";

  while (millis() - start < timeout) {
    while (LoRaSerial.available()) {
      resposta += (char)LoRaSerial.read();
    }
  }

  if (resposta.length() > 0) {
    Serial.print("[RESPOSTA - LoRa] -> ");
    Serial.print(resposta);
  } else {
    Serial.println("[RESPOSTA] -> Nenhum retorno recebido");
  }
}

// =======================================================================

void setup() {
  Serial.begin(115200);
  delay(2000);

  Serial.println("\n[SETUP] Inicializando comunicação com o módulo Radioenge...");

  // Inicializa UART simulada para o LoRa
  LoRaSerial.begin(9600);
  delay(1000);

  // --- CONFIGURAÇÃO DO MÓDULO LORAWAN ---
  Serial.println("[SETUP] Configurando o módulo para operar na TTN via ABP...\n");
  
  enviaComandoLoRa("AT+DEUI=?");
  enviaComandoLoRa("AT");
  enviaComandoLoRa("AT+NJM=0");
  enviaComandoLoRa("AT+CLASS=A");
  enviaComandoLoRa("AT+ADR=0");
  enviaComandoLoRa("AT+DR=5");
  enviaComandoLoRa("AT+DADDR=" + String(DEVADDR));
  enviaComandoLoRa("AT+NWKSKEY=" + String(NWKSKEY));
  enviaComandoLoRa("AT+APPSKEY=" + String(APPSKEY));
  enviaComandoLoRa("AT+CHMASK=0100:0000:0000:0000:0000:0000");

  Serial.println("\n[SETUP] Configuração finalizada. Módulo pronto.\n");
  Serial.println("--- Iniciando o loop() de operação ---\n");
  delay(2000);
}

// =======================================================================

const unsigned long intervalo = 60000; 

void loop() {
  static unsigned long ultimaMensagem = 0;

  if (millis() - ultimaMensagem > intervalo) {
    ultimaMensagem = millis();

    String porta = "1";
    String payloadHex = "01020304";

    Serial.println("[MSG] Enviando dados: " + porta + ":" + payloadHex);
    enviaComandoLoRa("AT+SENDB=" + porta + ":" + payloadHex, 5000);

    Serial.println("======================================\n");
  }

  if (LoRaSerial.available()) {
    String msg = LoRaSerial.readString();
    Serial.print("[LoRa] <- (Mensagem não solicitada): ");
    Serial.println(msg);
  }
}
