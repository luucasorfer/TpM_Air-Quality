// ============================================================
//  END DEVICE DHT22 + LORAWAN RADIOENGE (MoT)
// ============================================================

#include <Arduino.h>
#include <DHT.h>
#include <SoftwareSerial.h>

// ============================================================
// CONFIGURAÇÕES GERAIS
// ============================================================

#define DEBUG_SERIAL_BAUD 115200
#define INTERVALO_ENVIO_MS 120000  // 1 minuto

// SENSOR DHT22
#define DHT_PIN D4   // GPIO2

// MÓDULO LORA
#define LORA_RX 13   // D7
#define LORA_TX 15   // D8

// CREDENCIAIS TTN (ABP)
const char* DEVADDR = "26:0D:43:45";
const char* APPSKEY = "D9:B2:0A:74:27:CF:C2:A4:4C:42:8C:E6:9D:5D:97:C7";
const char* NWKSKEY = "AB:DE:71:8B:0D:AC:8F:0B:17:87:BE:0B:76:68:54:BE";

// Máscara AU915 — canais 8–15
const char* CHMASK = "0100:0000:0000:0000:0000:0000";

#define MOT_PAYLOAD_SIZE 25   // até byte 24

// ============================================================
// SISTEMA DE LOGS
// ============================================================

#define DEBUG_ENABLED 1
#define LOG_LEVEL 3

#define LOG_ERROR(msg) if(LOG_LEVEL>=0 && DEBUG_ENABLED){Serial.println("[ERROR] "+String(msg));}
#define LOG_WARN(msg)  if(LOG_LEVEL>=1 && DEBUG_ENABLED){Serial.println("[WARN] "+String(msg));}
#define LOG_INFO(msg)  if(LOG_LEVEL>=2 && DEBUG_ENABLED){Serial.println("[INFO] "+String(msg));}
#define LOG_DEBUG(msg) if(LOG_LEVEL>=3 && DEBUG_ENABLED){Serial.println("[DEBUG] "+String(msg));}

// ============================================================
// CLASSE SENSOR DHT22
// ============================================================

class SensorDHT {
public:
    SensorDHT() : dht(DHT_PIN, DHT22) {}
    
    void begin() {
        dht.begin();
        LOG_INFO("Sensor DHT22 inicializado");
    }

    float readTemperature() {
        float t = dht.readTemperature();
        if (isnan(t)) {
            LOG_WARN("Falha ao ler temperatura");
            return 0.0;
        }
        LOG_DEBUG("Temperatura: " + String(t) + " °C");
        return t;
    }

    float readHumidity() {
        float h = dht.readHumidity();
        if (isnan(h)) {
            LOG_WARN("Falha ao ler umidade");
            return 0.0;
        }
        LOG_DEBUG("Umidade: " + String(h) + " %");
        return h;
    }

private:
    DHT dht;
};

// ============================================================
// CLASSE MONTADOR DE PAYLOAD MoT
// ============================================================

class PayloadBuilder {
public:
    static void buildPayload(float temperature, float humidity, uint8_t* payload, uint8_t packet_counter) {
        // Inicializa com zeros (até byte 24)
        for (int i = 0; i < MOT_PAYLOAD_SIZE; i++)
            payload[i] = 0x00;

        int16_t temp_int = (int16_t)(temperature * 100);
        int16_t hum_int  = (int16_t)(humidity * 100);

        payload[8]  = 50;   // End Dest
        payload[10] = 1;    // End Orig
        payload[12] = packet_counter;

        payload[20] = (uint8_t)(temp_int >> 8);
        payload[21] = (uint8_t)(temp_int & 0xFF);

        payload[23] = (uint8_t)(hum_int >> 8);
        payload[24] = (uint8_t)(hum_int & 0xFF);
    }

    // Validação completa
    static bool validatePayload(const uint8_t* payload) {
        if (payload == nullptr) return false;

        if (payload[8] != 50 || payload[10] != 1 || payload[12] == 0) {
            return false;
        }

        float temp = ((payload[20] << 8) | payload[21]) / 100.0;
        float hum  = ((payload[23] << 8) | payload[24]) / 100.0;

        if (temp < -40 || temp > 80) return false;
        if (hum < 0 || hum > 100) return false;

        return true;
    }
};

// ============================================================
// CLASSE MODULO LORA (RADIOENGE)
// ============================================================

class LoRaModule {
public:
    LoRaModule() : loraSerial(LORA_RX, LORA_TX) {}

    void begin() {
        loraSerial.begin(9600);
        delay(1000);
        LOG_INFO("Módulo LoRa inicializado");
    }

    void sendCommand(const String &cmd, unsigned long timeout = 3000) {
        while (loraSerial.available()) loraSerial.read();
        
        loraSerial.print(cmd + "\r\n");
        LOG_INFO("[COMANDO] -> " + cmd);

        unsigned long start = millis();
        String resp = "";
        
        while (millis() - start < timeout) {
            while (loraSerial.available()) resp += (char)loraSerial.read();
        }

        if (resp.length() > 0){
            LOG_INFO("[RESPOSTA] -> " + resp);
        }else{
            LOG_WARN("Nenhuma resposta recebida");
        }
    }

    void sendPayload(const String &porta, const String &payload) {
        sendCommand("AT+SENDB=" + porta + ":" + payload, 5000);
        LOG_INFO("Payload enviado: " + payload + " pela porta " + porta);
    }

private:
    SoftwareSerial loraSerial;
};

// ============================================================
// OBJETOS
// ============================================================

SensorDHT sensor;
LoRaModule lora;
uint8_t packet_counter = 0;

// ============================================================
// SETUP
// ============================================================

void setup() {
    Serial.begin(DEBUG_SERIAL_BAUD);
    delay(2000);

    LOG_INFO("Inicializando sistema...");
    sensor.begin();
    lora.begin();

    LOG_INFO("======================================");

    // Configurações LoRaWAN ABP
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

// ============================================================
// LOOP PRINCIPAL
// ============================================================

void loop() {
    static unsigned long ultimaMensagem = 0;

    if (millis() - ultimaMensagem > INTERVALO_ENVIO_MS) {
        ultimaMensagem = millis();

        float temp = sensor.readTemperature();
        float hum  = sensor.readHumidity();

        packet_counter++;

        uint8_t payload_bytes[MOT_PAYLOAD_SIZE];
        PayloadBuilder::buildPayload(temp, hum, payload_bytes, packet_counter);

        // 🔍 validação do pacote
        if (!PayloadBuilder::validatePayload(payload_bytes)) {
            LOG_ERROR("Payload inválido! Cancelando envio.");
            return;
        }

        // Converte para string HEX
        String payload = "";
        for (int i = 0; i < MOT_PAYLOAD_SIZE; i++) {
            if (payload_bytes[i] < 0x10) payload += "0";
            payload += String(payload_bytes[i], HEX);
            payload.toUpperCase();
        }

        LOG_INFO("Temp= " + String(temp) + "°C | Umid= " + String(hum) + "%");
        LOG_INFO("Payload MoT: " + payload + " | Bytes: " + String(MOT_PAYLOAD_SIZE) +
                 " | Contador: " + String(packet_counter));

        lora.sendPayload("1", payload);

        LOG_INFO("======================================");
    }
}
