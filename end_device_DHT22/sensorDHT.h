// sensorDHT.h

#ifndef SENSOR_DHT_H
#define SENSOR_DHT_H

#include <Arduino.h>
#include <DHT.h>
#include "config.h"

class SensorDHT {
public:
    SensorDHT();
    void begin();
    float readTemperature();
    float readHumidity();
private:
    DHT dht;
};

#endif
