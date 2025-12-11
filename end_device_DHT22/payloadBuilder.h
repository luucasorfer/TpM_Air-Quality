// payloadBuilder.h

#ifndef PAYLOAD_BUILDER_H
#define PAYLOAD_BUILDER_H

// Tamanho mínimo do payload MoT para os dados solicitados (até o byte 24)
#define MOT_PAYLOAD_SIZE 25

#include <Arduino.h>

class PayloadBuilder {
public:
    static void buildPayload(float temperature, float humidity, uint8_t* payload, uint8_t packet_counter);
};

#endif
