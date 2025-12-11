# 🌡️ End-Device LoRa com ESP8266 e DHT22

Este projeto lê **temperatura e umidade** usando o sensor **DHT22**, monta um **payload compacto (em bytes)** e envia os dados via **LoRaWAN (ABP)** para a **The Things Network (TTN)** via **módulo LoRaWAN Radioenge** usando comandos **AT**.

O código está **modularizado**, fácil de entender e de expandir, permitindo:
-   Separação de responsabilidades (sensor, payload, LoRa, debug)
-   Fácil manutenção
-   Logs detalhados para depuração


## 🧩 Componentes utilizados

| Componente               			| Função                     | Observação                    |
| ----------------------------- | -------------------------- | ----------------------------- |
| **ESP8266 v2 (NodeMCU)**  		| Microcontrolador com Wi-Fi | Principal unidade de controle |
| **Sensor DHT22**          		| Mede temperatura e umidade | Usa 1 pino digital            |
| **Módulo LoRaWAN  Radioenge** | Comunicação LoRaWAN        | Conecta à TTN                 |
| **Jumpers / Protoboard**  		| Conexões                   | Montagem simples              |
| **Cabo USB**              		| Alimentação e programação  | Conecta ao PC                 |


## ⚙️ Ligações (Pinout)

| ESP8266     | DHT22 | LoRa Radioenge    |
| ----------- | ----- | ----------------- |
| 3V3         | VCC   | VCC               |
| GND         | GND   | GND               |
| D4          | DATA  | —                 |
| D7 (GPIO13) | —     | RX (entrada LoRa) |
| D8 (GPIO15) | —     | TX (saída LoRa)   |

> 📘 **Importante:** O módulo LoRa usa comunicação serial (SoftwareSerial) nos pinos D7 e D8.


## 🪛 Instalação do ambiente

1. **Baixe e instale o Arduino IDE**
   👉 [https://www.arduino.cc/en/software](https://www.arduino.cc/en/software)

2. **Adicione a placa ESP8266**

   * Vá em: `Arquivo → Preferências`
   * Em “URLs Adicionais para Gerenciadores de Placas”, cole:

     ```http
     https://arduino.esp8266.com/stable/package_esp8266com_index.json
     ```
   * Vá em: `Ferramentas → Placa → Gerenciador de Placas`
   * Pesquise por **ESP8266** e instale.

3. **Instale as bibliotecas necessárias**

   * Vá em: `Sketch → Incluir Biblioteca → Gerenciar Bibliotecas...`
   * Pesquise e instale:

     * `DHT sensor library` (by Adafruit)
     * `Adafruit Unified Sensor`
     * `SoftwareSerial`


## 🗂️ Estrutura do projeto

```
end_device_DHT22/
│
├── config.h / config.cpp					← Configurações globais (pinos, credenciais)
├── debug.h									← Sistema de logs
├── sensorDHT.h / sensorDHT.cpp				← Leitura do sensor
├── payloadBuilder.h / payloadBuilder.cpp	← Montagem de payload em HEX
├── loraModule.h / loraModule.cpp			← Comunicação LoRa via AT
└── end_device_DHT22.ino					← Código principal (main)
```


## 🧠 Como o projeto funciona

1. O **ESP8266** lê **temperatura e umidade** do **DHT22**.
2. Os valores são convertidos para **2 bytes cada** (temperatura e umidade ×100).
3. O **payload hexadecimal** (ex: `09421C65`) é montado.
4. O ESP envia esse payload via **módulo LoRa Radioenge** para a **TTN**.
5. O **tamanho real do payload (em bytes)** é mostrado no Serial.


## 🧾 Exemplo de saída no Serial

```
[INFO] Inicializando sistema...
[INFO] T=23.7C | U=72.7%
[INFO] Payload: 09421C65 | Tamanho em bytes: 4
[INFO] Enviando via LoRa...
======================================
```


## 📡 Estrutura do Payload e Envio
-   Exemplo de payload enviado:  
    `09421C65` → Temperatura + Umidade em HEX
    
-   Intervalo de envio configurável em `config.h`:
	`#define INTERVALO_ENVIO_MS 60000  // 1 minuto`

-	Porta LoRa configurável no `loop()`

### 🧮 Interpretando os dados
O payload é de **4 bytes**:

| Bytes | Em HEX	| Em decimal | Dividido por 100 | Resultado									| 
| ----- | ------- | ---------- | ---------------- | ------------------------- |
| 0–1   | `0942`	| 2370       | 23.70						|	0x0942 = 2370 → 23.70 °C	|
| 2–3   | `1C65`	| 7270       | 72.70						|	0x1C65 = 7270 → 72.70 % 	|
Total: **4 bytes (8 caracteres hex)**

>Você pode enviar até **50 bytes** no máximo. 
>Se o payload ficar maior que 50 bytes, o LoRa pode rejeitar.

### 🧠 Exemplo de Saída no Serial Monitor
```csharp
[Main][INFO] Inicializando sistema...
[Sensor][INFO] DHT22 inicializado.
[LoRa][INFO] Módulo pronto.
[Sensor][DEBUG] Temperatura: 23.70 °C
[Sensor][DEBUG] Umidade: 72.70 %
[Payload][INFO] Payload: 09421C65
[Main][INFO] T=23.701°C | U=72.70%
[LoRa][INFO] Enviando via LoRa (porta 1)
```


## 🛰️ Configuração TTN (ABP)

1. Crie uma conta em [The Things Network](https://www.thethingsnetwork.org/).
2. Adicione um **End-Device (ABP)** na sua aplicação.
3. Copie:

   * **Device Address (DevAddr)**
   * **Network Session Key (NwkSKey)**
   * **App Session Key (AppSKey)**
4. Coloque essas chaves em `config.cpp`:

```cpp
const char* DEVADDR = "00:00:00:00";
const char* APPSKEY = "00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00";
const char* NWKSKEY = "00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00";
```


## 🧩 Principais arquivos

#### 🟩 `end_device_DHT22.ino`

Código principal:

* Faz leitura dos sensores.
* Monta e envia o payload.
* Mostra o tamanho real em bytes.

**🟦 `sensorDHT.cpp/h`**: Cuida da leitura do DHT22.

**🟨 `payloadBuilder.cpp/h`**: Converte os dados coletados (temperatura e umidade) em bytes hexadecimais.

**🟧 `loraModule.cpp/h`**: Cuida da comunicação com o módulo LoRa via comandos **AT**.

#### 🟫 `debug.h`

Sistema de Logs facilitado com níveis de importância:

|	Nível	|	Comando						|	Descrição						|
| ----- | ----------------- | ------------------- |
|	ERROR	|	`LOG_ERROR(msg);`	|	Erro detectado			|
|	WARN	|	`LOG_WARN(msg);`	|	Aviso importante		|
|	INFO	|	`LOG_INFO(msg);`	|	Informações gerais	|
|	DEBUG	|	`LOG_DEBUG(msg);`	|	Depuração detalhada	|

Configuração em `debug.h`:
- No topo, basta trocar:
	```cpp
	#define LOG_LEVEL 2
	```
	|	Valor	| Mostra até							| Exemplo																			| Quando usar         |
	| --------- | ------------------------------- | ------------------------------------------------------------- | ------------------- |
	|	0			|	Somente `ERROR`				| `[Sensor][ERROR] Falha ao ler DHT!`					| Erros críticos      |
	|	1			|	`ERROR`, `WARN`				| `[LoRa][WARN] Sem resposta do módulo.`				| Situações anormais  |
	|	2			|	`ERROR`, `WARN`, `INFO`	| `[Main][INFO] Sistema iniciado.`							| Estado normal       |
	|	3			|	Todos (inclui `DEBUG`)		| `[Payload][DEBUG] Payload montado: 09E91620`	| Depuração detalhada |

- E para **remover tudo** do código compilado (modo produção):
	```cpp
	#define DEBUG_ENABLED 0 // 0 = Desativa 1 = Ativa
	```

	
## 🚀 Expansões possíveis

* Adicionar sensores de pressão, luminosidade, CO₂, etc.
* Enviar os dados via Wi-Fi e LoRa simultaneamente.
* Gravar histórico em cartão SD.
* Criar dashboard na TTN ou Node-RED.


## 💡 Dicas finais

✅ Use **alimentação estável** (mínimo 500 mA).
✅ Evite fios muito longos no DHT22.
✅ **Payload ≤ 50 bytes:** Mesmo com expansões futuras (outros sensores), continua dentro do limite.
✅ Teste primeiro no **Serial Monitor** antes de enviar à TTN.
