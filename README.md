# TpM_Air-Quality: Monitoramento de Temperatura e Umidade via LoRaWAN

Este repositório documenta o projeto de **Monitoramento de Temperatura e Umidade via LoRaWAN**, com foco na análise de rede e na estruturação completa do sistema de acordo com a **Metodologia TpM (Three-phase Methodology)** da Unicamp.

O projeto visa demonstrar a aplicação prática de soluções de Internet das Coisas (IoT) para monitoramento de qualidade do ar em ambientes residenciais, utilizando uma arquitetura robusta e validada.

| Recurso                            | Link                                                                                                   |
| :--------------------------------- | :----------------------------------------------------------------------------------------------------- |
| **Aplicação (Dashboard)**          | [https://air-quality-tpm.vercel.app/](https://air-quality-tpm.vercel.app/)                             |
| **Repositório Principal**          | [https://github.com/luucasorfer/TpM_Air-Quality](https://github.com/luucasorfer/TpM_Air-Quality)       |
| **Repositório do Webhook (Borda)** | [https://github.com/luucasorfer/ttn-webhook-server](https://github.com/luucasorfer/ttn-webhook-server) |

---

## Estrutura do Projeto: Metodologia TpM

A Metodologia de Três Fases (TpM) da Unicamp é um framework robusto para o desenvolvimento de sistemas de IoT, garantindo que o projeto passe por etapas bem definidas de concepção, modelagem e validação. O projeto foi integralmente estruturado seguindo esta abordagem.

### Fase 1: Requisitos e Negócio (Exploração e Diagnóstico)

Esta fase inicial concentra-se na identificação do problema, na definição dos requisitos de negócio e na proposição da solução tecnológica.

#### Identificação do Problema:

O relatório do cliente apontou a necessidade do **monitoramento residencial contínuo da qualidade do ar**, especialmente para indivíduos com alergias respiratórias. A variação de temperatura e umidade é um fator chave que afeta a proliferação de alérgenos e o conforto respiratório. O requisito principal é a coleta de dados ambientais de forma confiável e com baixo consumo de energia.

#### Solução:

A solução proposta é um sistema de monitoramento baseado em **IoT LoRaWAN**, que ofereçe um baixo consumo de energia e longo alcance, ideal para aplicações residenciais e urbanas. O sistema captura dados de temperatura e umidade e os transporta de forma eficiente até um dashboard de análise, atendendo ao requisito de visibilidade e tomada de decisão.

### Fase 2: Definição deas Tecnologias (Modelo Top-Down)

A segunda fase da TpM, de Modelagem e Projeto, utiliza uma abordagem _Top-Down_ para definir as tecnologias e a arquitetura conceitual do sistema, sem entrar em detalhes de implementação. O foco é na escolha das plataformas e protocolos que atendem aos requisitos de negócio.

#### Arquitetura Conceitual

O sistema é estruturado em uma arquitetura de seis níveis, conforme o Modelo de Referência de Sistemas Abertos (OSRM) para IoT. As escolhas tecnológicas foram guiadas pelas necessidades apontadas na primeira fase como o baixo consumo de energia e escalabilidade:

| Nível OSRM             | Função                                  | Tecnologia Selecionada             | Justificativa                                                                                                           |
| :--------------------- | :-------------------------------------- | :--------------------------------- | :---------------------------------------------------------------------------------------------------------------------- |
| **6 (Aplicação)**      | Visualização                            | React com Vite                     | Framework de Frontend Moderno com uma interface interativa e responsiva para análise de dados em tempo real e não real. |
| **5 (Abstração)**      | Normalização e Parametrização dos Dados | API RESTful                        | Garante a confiabilidade dos dados, parâmetros para exibição e a integração com o frontend e outras aplicações.         |
| **4 (Armazenamento)**  | Persistência                            | Banco de Dados NoSQL com MongoDB   | Garante flexibilidade e performance para lidar com o fluxo contínuo de dados de sensores.                               |
| **3 (Borda)**          | Processamento                           | Webhook com API Node               | Garante o recebimento, validação e envio dos dados para o nível 4 (Armazenamento)                                       |
| **2 (Conectividade)**  | Comunicação de Longo Alcance            | LoRaWAN e The Things Network (TTN) | Protocolo ideal para IoT que exige baixo consumo e grande cobertura.                                                    |
| **1 (Sensor/Atuador)** | Coleta de Dados                         | Microcontrolador com sensor de T/U | Solução de baixo custo e alta disponibilidade para medição ambiental.                                                   |

### Fase 3: Implementação e Técnicas (Modelo Bottom-Up)

A fase final da TpM, de Implementação e Resultados, utiliza uma abordagem _Bottom-Up_ para detalhar as técnicas e tecnologias específicas utilizadas em cada nível da arquitetura, culminando na validação do sistema.

#### Nível 1: Hardware e Payload

- **Componentes:** Utilização do **NODEMCU-ESP8266** como microcontrolador e do sensor **DHT22** para temperatura e umidade, com módulo **RadioEnge LoRaWAN** para transmissão do end-device. Já para o gateway, foi utilizado um **ESP32** como microcontrolador e um módulo **RFM95 LoRa(915)**.
- **MoT:** O _payload_ de dados foi otimizado para um tamanho máximo de **50 bytes**, seguindo o padrão do MoT.

#### Nível 2: Conectividade e Análise de Rede

A configuração da rede no TTN (The Things Network) envolveu a definição de um _decoder_ para o _payload_ e a parametrização de **frequencia**, **Spreading Factor (SF)** e **Bandwidth (BW)**.

##### Análise de Qualidade de Sinal

A qualidade da rede foi validada através de métricas de sinal:

| Métrica                                       | Valor Médio | Interpretação                                                                            |
| :-------------------------------------------- | :---------- | :--------------------------------------------------------------------------------------- |
| **RSSI (Received Signal Strength Indicator)** | **-81 dBm** | Força de sinal robusta, indicando boa recepção no Gateway.                               |
| **SNR (Signal-to-Noise Ratio)**               | **9 dB**    | Classificado como **excelente**, demonstrando alta clareza do sinal em relação ao ruído. |

##### Análise de Pacotes

- **Taxa de Perda de Pacotes:** **1.33%**
- **Uptime do Sistema:** **99.5%**

A baixa taxa de perda e o alto _uptime_ confirmam a **alta confiabilidade** da rede LoRaWAN implementada.

#### Nível 3-4: Borda e Armazenamento

O backend (borda) recebe os dados do TTN via _webhook_ e aplica técnicas de validação e persistência:

- **Validação de Dados:** Uso da biblioteca **Zod** para validação rigorosa do _schema_ dos dados recebidos.
- **Detecção de Duplicatas:** Implementação de _hashing_ **SHA-256** no _payload_ para identificar e descartar mensagens duplicadas.
- **Armazenamento:** **MongoDB** foi escolhido como banco de dados NoSQL, com _schema_ otimizado e índices configurados para garantir alta performance em consultas.

#### Nível 5: APIs de Análise

A camada de API expõe os dados processados, facilitando o consumo pelo frontend.

| Endpoint                 | Descrição                                 |
| :----------------------- | :---------------------------------------- |
| `/health`                | Status de saúde da API.                   |
| `/api/sensor/latest`     | Última leitura de temperatura e umidade.  |
| `/api/sensor/readings`   | Histórico de leituras em um período.      |
| `/api/sensor/statistics` | Estatísticas agregadas (média, min, max). |
| `/api/sensor/quality`    | Dados de qualidade de sinal (RSSI, SNR).  |

#### Nível 6: Dashboard React

O frontend é a interface de visualização, construído com **React**, utilizando **Recharts** para a renderização de gráficos e **Tailwind CSS** para estilização.

- **Funcionalidade:** O dashboard permite a visualização de dados em tempo real, gráficos históricos de T/U e a aba de Qualidade do Sinal para monitoramento contínuo da rede.

#### Resultados e Conformidade

O projeto atingiu as seguintes metas:

- **Conformidade TpM:** 100% de aderência à Metodologia de Três Fases da Unicamp.
- **Implementação OSRM:** Conclusão bem-sucedida de todos os 6 níveis do Modelo de Referência.
- **Status:** O sistema encontra-se em **status de produção**, validando a solução proposta na Fase 1.

---

## Conclusões e Próximos Passos

#### Conclusões

O projeto MoT LoRaWAN demonstrou a viabilidade e a robustez de uma solução de monitoramento de qualidade do ar baseada em LoRaWAN. A aplicação rigorosa da Metodologia TpM e a análise detalhada dos parâmetros de rede (RSSI e SNR) resultaram em um sistema funcional, confiável e com alta taxa de _uptime_.

#### Próximos Passos

1.  **Monitoramento Contínuo:** Manter o sistema em produção e monitorar a performance a longo prazo.
2.  **Otimização de Rede:** Explorar ajustes finos no Spreading Factor e na frequência de transmissão para otimizar o consumo de energia.
3.  **Expansão Futura:** Integrar novos sensores (e.g., Partículas Sólidas - PM2.5) e expandir a cobertura da rede.

---

## Como Contribuir

Contribuições são bem-vindas! Por favor, consulte o repositório principal para detalhes sobre como configurar o ambiente de desenvolvimento e submeter _pull requests_.
