// loraModule.cpp

#include "loraModule.h"
#include "debug.h"

LoRaModule::LoRaModule() : loraSerial(LORA_RX, LORA_TX) {}

void LoRaModule::begin() {
    loraSerial.begin(9600);
    delay(1000);
    LOG_INFO("Módulo LoRa inicializado");
}

void LoRaModule::sendCommand(const String &cmd, unsigned long timeout) {
    while (loraSerial.available()) loraSerial.read();
    loraSerial.print(cmd + "\r\n");
    LOG_INFO("[COMANDO] -> " + cmd);

    unsigned long start = millis();
    String resp = "";
    while (millis() - start < timeout) {
        while (loraSerial.available()) resp += (char)loraSerial.read();
    }

    if (resp.length() > 0) {
        LOG_INFO("[RESPOSTA] -> " + resp);
    } else {
        LOG_WARN("Nenhuma resposta recebida");
    }
}

void LoRaModule::sendPayload(const String &porta, const String &payload) {
    sendCommand("AT+SENDB=" + porta + ":" + payload, 5000);
    LOG_INFO("Payload enviado: " + payload + " pela porta " + porta);
}
