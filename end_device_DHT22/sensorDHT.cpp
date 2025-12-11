// sensorDHT.cpp

#include "sensorDHT.h"
#include "debug.h"

SensorDHT::SensorDHT() : dht(DHT_PIN, DHT22) {}

void SensorDHT::begin() {
    dht.begin();
    LOG_INFO("Sensor DHT22 inicializado");
}

float SensorDHT::readTemperature() {
    float t = dht.readTemperature();
    if (isnan(t)) {
        LOG_WARN("Falha ao ler temperatura");
        return 0.0;
    }
    LOG_DEBUG("Temperatura: " + String(t) + " °C");
    return t;
}

float SensorDHT::readHumidity() {
    float h = dht.readHumidity();
    if (isnan(h)) {
        LOG_WARN("Falha ao ler umidade");
        return 0.0;
    }
    LOG_DEBUG("Umidade: " + String(h) + " %");
    return h;
}
