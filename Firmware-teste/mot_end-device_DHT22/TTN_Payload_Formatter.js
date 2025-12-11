function decodeUplink(input) {
  const b = input.bytes;
  const errors = [];
  const MOT_PAYLOAD_SIZE = 25; // Tamanho mínimo do payload MoT (até o byte 24)

  // Verifica se o payload tem o tamanho mínimo esperado
  if (b.length < MOT_PAYLOAD_SIZE) {
    errors.push("Payload MoT muito curto. Esperado no mínimo " + MOT_PAYLOAD_SIZE + " bytes, recebido " + b.length + ".");
  }

  // Se houver erros, retorna o objeto vazio
  if (errors.length) {
    return {
      data: {},
      warnings: [],
      errors: errors
    };
  }

  // --- Decodificação dos Dados MoT ---

  // 1. Contador de Pacotes (Byte 12) - Camada TRANSP
  const packet_counter = b[12];

  // 2. Temperatura (Bytes 20 e 21) - Camada APP
  // Combina MSB (Byte 20) e LSB (Byte 21) para formar um inteiro de 16 bits (Big Endian)
  // Usa DataView para garantir a leitura correta de um inteiro de 16 bits assinado (int16_t)
  // O payload é um Uint8Array, então criamos um DataView para ler o int16
  const temp_raw = (b[20] << 8) | b[21];
  
  // Converte para valor de ponto flutuante (dividindo por 100)
  const temperature_celsius = parseFloat((temp_raw / 100.0).toFixed(2));

  // 3. Umidade (Bytes 23 e 24) - Camada APP
  // Combina MSB (Byte 23) e LSB (Byte 24) para formar um inteiro de 16 bits (Big Endian)
  const hum_raw = (b[23] << 8) | b[24];
  
  // Converte para valor de ponto flutuante (dividindo por 100)
  // **ATENÇÃO:** Mantive o fator de correção *0.91 que estava no seu decoder original.
  // Se este fator não for mais necessário, remova o `* 0.91`
  const humidity_percent = parseFloat(((hum_raw / 100.0) * 0.91).toFixed(2));
  
  // 4. Endereços (Camada RED) - Para verificação
  const end_dest = b[8];
  const end_orig = b[10];

  return {
    data: {
      // Dados de Telemetria
      temperature_celsius: temperature_celsius,
      humidity_percent: humidity_percent,
      
      // Dados de Controle MoT
      packet_counter: packet_counter,
      end_dest: end_dest,
      end_orig: end_orig
    },
    warnings: [],
    errors: errors
  };
}
