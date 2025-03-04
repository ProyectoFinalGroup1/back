// src/crypto-polyfill.ts
// Solución para el error de crypto en NestJS
import * as nodeCrypto from 'crypto';

// Solo aplicar el polyfill si no existe crypto global
if (!global.crypto) {
  // Creamos un objeto que cumple con la interfaz mínima que necesita el programador de tareas
  const crypto = {
    // Esta función es la que usa el programador de tareas de NestJS
    randomUUID: () => {
      return nodeCrypto.randomUUID();
    },
  };

  // Lo asignamos al global
  (global as any).crypto = crypto;
}
