// loraModule.h

#ifndef LORA_MODULE_H
#define LORA_MODULE_H

#include <Arduino.h>
#include <SoftwareSerial.h>
#include "config.h"

class LoRaModule {
public:
    LoRaModule();
    void begin();
    void sendCommand(const String &cmd, unsigned long timeout=3000);
    void sendPayload(const String &porta, const String &payload);
private:
    SoftwareSerial loraSerial;
};

#endif
