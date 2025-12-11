# Estrutura de Pacote LoRaWAN MoT para TTN (ESP8266 + Radioenge + DHT22)

Este documento detalha a estrutura de bytes do pacote LoRaWAN, seguindo o "Mapa de Pacote MoT" fornecido, e demonstra como os dados de telemetria de um sensor DHT22 (temperatura e umidade) devem ser mapeados para o payload, juntamente com os campos de cabeçalho obrigatórios. O objetivo é preparar o payload para envio via um módulo LoRaWAN Radioenge, gerenciado por um ESP8266, para a rede The Things Network (TTN).

## 1. Mapeamento de Campos Solicitados

O mapa de pacotes MoT (Machine-to-Thing) define a alocação de bytes para diferentes camadas de comunicação (PHY, MAC, RED, TRANSP, APP). A tabela a seguir resume o mapeamento específico solicitado para o projeto:

| Campo | Camada | Posição (Byte) | Tamanho (Bytes) | Descrição | Valor/Dado |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **End Dest** | RED | 8 | 1 | Endereço de Destino | **50** (Solicitado) |
| **End Orig** | RED | 10 | 1 | Endereço de Origem | **1** (Solicitado) |
| **Cont PCK up** | TRANSP | 12 | 1 | Contador de Pacotes Enviados | **Contador** (Variável) |
| **Temperatura** | APP up (ADC1) | 20-21 | 2 | Leitura do sensor DHT22 | **Dado do Sensor** |
| **Umidade** | APP up (ADC2) | 23-24 | 2 | Leitura do sensor DHT22 | **Dado do Sensor** |

**Observação sobre os Campos de Dados (Temperatura e Umidade):**

Os sensores como o DHT22 geralmente fornecem dados de ponto flutuante (ex: 25.5°C). Para enviar esses dados de forma eficiente em um payload LoRaWAN, que é tipicamente uma sequência de bytes, é uma prática comum multiplicar o valor por um fator (ex: 10 ou 100) e enviar o resultado como um **inteiro** de 2 bytes (16 bits).

*   **Temperatura (Bytes 20 e 21):** O valor de temperatura deve ser multiplicado por 100 e convertido para um inteiro de 16 bits (ex: 25.5°C -> 2550). Isso permite uma precisão de duas casas decimais.
*   **Umidade (Bytes 23 e 24):** O valor de umidade deve ser multiplicado por 100 e convertido para um inteiro de 16 bits (ex: 60.1% -> 6010). Isso também permite uma precisão de duas casas decimais.

## 2. Estrutura do Payload (Bytes)

O payload final será uma sequência de bytes. Assumindo que o payload comece no byte 0, a estrutura será a seguinte, com foco nos bytes relevantes:

| Byte | Campo | Valor Exemplo | Observações |
| :--- | :--- | :--- | :--- |
| 0-7 | Cabeçalhos PHY/MAC | *Preenchido pelo módulo LoRaWAN* | Normalmente gerenciado pelo firmware do módulo (Radioenge). |
| **8** | **End Dest** | `50` (0x32) | Endereço de Destino (solicitado). |
| 9 | Rede Dest | *Vazio/Padrão* | Não especificado, usar valor padrão (0x00). |
| **10** | **End Orig** | `1` (0x01) | Endereço de Origem (solicitado). |
| 11 | Rede Orig | *Vazio/Padrão* | Não especificado, usar valor padrão (0x00). |
| **12** | **Cont PCK up** | `N` | Contador de Pacotes (incrementado a cada envio). |
| 13-19 | Cabeçalhos TRANSP/APP up | *Vazio/Padrão* | Não especificado, usar valor padrão (0x00). |
| **20** | **Temperatura (MSB)** | `0x09` | Byte Mais Significativo (Exemplo: 2550 -> 0x09F6). |
| **21** | **Temperatura (LSB)** | `0xF6` | Byte Menos Significativo (Exemplo: 2550 -> 0x09F6). |
| 22 | ADC2 (Byte 1) | *Vazio/Padrão* | Não especificado, usar valor padrão (0x00). |
| **23** | **Umidade (MSB)** | `0x17` | Byte Mais Significativo (Exemplo: 6010 -> 0x177A). |
| **24** | **Umidade (LSB)** | `0x7A` | Byte Menos Significativo (Exemplo: 6010 -> 0x177A). |
| 25+ | Restante do Payload | *Vazio/Padrão* | Preencher com 0x00 ou conforme necessidade. |

## 3. Exemplo de Código (Arduino/ESP8266)

O código a seguir demonstra como ler os dados do DHT22, processá-los para o formato inteiro de 16 bits (multiplicando por 100) e montar o array de bytes do payload.

Este exemplo assume que você está utilizando uma biblioteca para o módulo Radioenge que aceita um array de bytes (`uint8_t[]`) como payload para envio.

```cpp
#include <DHT.h>

// Definições de Hardware
#define DHTPIN D2        // Pino do ESP8266 conectado ao DHT22
#define DHTTYPE DHT22    // Tipo de sensor

DHT dht(DHTPIN, DHTTYPE);

// Variável global para o contador de pacotes
uint8_t packet_counter = 0;

// Tamanho total do payload (pelo menos até o byte 24)
const int PAYLOAD_SIZE = 25;

void setup() {
  Serial.begin(115200);
  dht.begin();
  // Inicialização do módulo LoRaWAN Radioenge (substitua pela sua lógica)
  // radioenge_lorawan_init(); 
}

void loop() {
  // 1. Leitura dos dados do DHT22
  float h = dht.readHumidity();
  float t = dht.readTemperature();

  // Verifica se a leitura foi bem-sucedida
  if (isnan(h) || isnan(t)) {
    Serial.println("Falha na leitura do DHT22!");
    return;
  }

  // 2. Processamento dos dados para inteiro de 16 bits (multiplicar por 100)
  // O tipo 'int16_t' garante 2 bytes (16 bits)
  int16_t temp_int = (int16_t)(t * 100);
  int16_t hum_int = (int16_t)(h * 100);

  // 3. Montagem do Payload MoT
  uint8_t payload[PAYLOAD_SIZE] = {0}; // Inicializa o array com zeros

  // Cabeçalhos (Bytes 0 a 7 - Deixados como 0, pois o módulo Radioenge pode preencher)
  // Se o módulo Radioenge exigir o payload completo, preencha com 0x00.

  // Camada RED
  payload[8] = 50; // End Dest (0x32)
  payload[9] = 0;  // Rede Dest (0x00)
  payload[10] = 1; // End Orig (0x01)
  payload[11] = 0; // Rede Orig (0x00)

  // Camada TRANSP
  packet_counter++; // Incrementa o contador
  payload[12] = packet_counter; // Cont PCK up

  // Camada APP up (Dados de Telemetria)
  
  // Temperatura (Bytes 20 e 21) - Big Endian (MSB primeiro, depois LSB)
  // Assumindo Big Endian, que é comum para transmissão de dados de rede.
  // Se a biblioteca do Radioenge exigir Little Endian, inverta a ordem.
  payload[20] = (uint8_t)(temp_int >> 8); // MSB
  payload[21] = (uint8_t)(temp_int & 0xFF); // LSB

  // Umidade (Bytes 23 e 24) - Big Endian
  payload[23] = (uint8_t)(hum_int >> 8); // MSB
  payload[24] = (uint8_t)(hum_int & 0xFF); // LSB

  // Exemplo de Impressão do Payload (para debug)
  Serial.print("Payload (Hex): ");
  for (int i = 0; i < PAYLOAD_SIZE; i++) {
    if (payload[i] < 0x10) Serial.print("0");
    Serial.print(payload[i], HEX);
    Serial.print(" ");
  }
  Serial.println();
  Serial.printf("Contador: %d, Temp: %.2f (0x%X), Hum: %.2f (0x%X)\n", 
                packet_counter, t, temp_int, h, hum_int);

  // 4. Envio do Pacote (Substitua pela sua função de envio)
  // radioenge_lorawan_send(payload, PAYLOAD_SIZE);

  delay(60000); // Envia a cada 1 minuto
}
```

## 4. Decodificação na TTN (Payload Decoder)

Para que a TTN entenda os dados, é necessário um *Payload Decoder* (função JavaScript) que inverta o processo de codificação (dividir por 100 e reverter a ordem dos bytes).

```javascript
function decodeUplink(input) {
  var data = input.bytes;
  var payload = {};

  // 1. Decodificação do Contador de Pacotes (Byte 12)
  payload.packet_counter = data[12];

  // 2. Decodificação da Temperatura (Bytes 20 e 21)
  // Combina MSB (Byte 20) e LSB (Byte 21) para formar um inteiro de 16 bits (Big Endian)
  var temp_raw = (data[20] << 8) | data[21];
  // Converte para valor de ponto flutuante (dividindo por 100)
  payload.temperature_celsius = temp_raw / 100.0;

  // 3. Decodificação da Umidade (Bytes 23 e 24)
  // Combina MSB (Byte 23) e LSB (Byte 24) para formar um inteiro de 16 bits (Big Endian)
  var hum_raw = (data[23] << 8) | data[24];
  // Converte para valor de ponto flutuante (dividindo por 100)
  payload.humidity_percent = hum_raw / 100.0;
  
  // 4. Decodificação dos Endereços (Opcional, para verificação)
  payload.end_dest = data[8];
  payload.end_orig = data[10];

  return {
    data: payload,
    warnings: [],
    errors: []
  };
}
```

Este decoder deve ser inserido na seção **Payload Formatters -> Uplink** da sua aplicação na The Things Network. Ele transformará o array de bytes em um objeto JSON legível, com os campos `packet_counter`, `temperature_celsius`, `humidity_percent`, `end_dest` e `end_orig`.
