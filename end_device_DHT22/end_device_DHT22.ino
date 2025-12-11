// end_device_DHT22.ino

#include <Arduino.h>
#include "config.h"
#include "debug.h"
#include "sensorDHT.h"
#include "payloadBuilder.h"
#include "loraModule.h"

// Contador de pacotes MoT
uint8_t packet_counter = 0;

// Objetos
SensorDHT sensor;
LoRaModule lora;

//unsigned long ultimaMensagem = 0;

void setup() {
    Serial.begin(DEBUG_SERIAL_BAUD);
    delay(2000);

    LOG_INFO("Inicializando sistema...");
    sensor.begin();
    lora.begin();
    
    printf("\n");
    LOG_INFO("======================================");

    // Configuração inicial LoRa
    lora.sendCommand("AT");
    lora.sendCommand("AT+NJM=0");
    lora.sendCommand("AT+CLASS=A");
    lora.sendCommand("AT+ADR=1");
    lora.sendCommand("AT+DR=5");
    lora.sendCommand("AT+DADDR=" + String(DEVADDR));
    lora.sendCommand("AT+NWKSKEY=" + String(NWKSKEY));
    lora.sendCommand("AT+APPSKEY=" + String(APPSKEY));
    lora.sendCommand("AT+CHMASK=" + String(CHMASK));

    LOG_INFO("======================================");
}

void loop() {
    static unsigned long ultimaMensagem = 0;

    if (millis() - ultimaMensagem > INTERVALO_ENVIO_MS) {
        ultimaMensagem += INTERVALO_ENVIO_MS;
        
        float temp = sensor.readTemperature();
        float hum = sensor.readHumidity();

        // Incrementa o contador MoT
        packet_counter++;
        
        // 1. Monta o payload MoT em um array de bytes
        
        uint8_t payload_bytes[MOT_PAYLOAD_SIZE];
        
        PayloadBuilder::buildPayload(temp, hum, payload_bytes, packet_counter);

        // 2. Converte o array de bytes para String HEX para o módulo Radioenge
        String payload = "";
        for (int i = 0; i < MOT_PAYLOAD_SIZE; i++) {
            if (payload_bytes[i] < 0x10) payload += "0";
            payload += String(payload_bytes[i], HEX);
            }

        printf("\n");

        LOG_INFO("Temp= " + String(temp) + "°C | Umid= " + String(hum) + "%");

        printf("\n");
        int tamanhoBytes = MOT_PAYLOAD_SIZE;
        LOG_INFO("Payload MoT: " + payload + " | Tamanho em bytes: " + String(MOT_PAYLOAD_SIZE) + " | Contador: " + String(packet_counter));
        
        printf("\n");
        lora.sendPayload("1", payload);

        LOG_INFO("======================================");
    }
}
