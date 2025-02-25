import * as dialogflow from '@google-cloud/dialogflow';
import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config(); // Cargar variables de entorno

@Injectable()
export class DialogflowService {
  private sessionClient: dialogflow.SessionsClient;
  private projectId: string;
  constructor() {
    const keyFile = process.env.DIALOGFLOW_KEY_FILE;
    const projectId = process.env.DIALOGFLOW_PROJECT_ID;
    const credentials = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

    if (!projectId) {
      throw new Error(
        'La variable de entorno DIALOGFLOW_PROJECT_ID no está definida',
      );
    }

    // Intentamos usar credenciales como JSON primero
    if (credentials) {
      try {
        this.sessionClient = new dialogflow.SessionsClient({
          credentials: JSON.parse(credentials),
        });
        this.projectId = projectId;
      } catch (error) {
        console.error('Error al parsear las credenciales JSON:', error);
        throw new Error('Las credenciales JSON no son válidas');
      }
    }
    // Si no hay JSON, intentamos usar el archivo
    else if (keyFile) {
      try {
        const keyPath = path.resolve(process.cwd(), keyFile);
        this.sessionClient = new dialogflow.SessionsClient({
          keyFilename: keyPath,
        });
        this.projectId = projectId;
      } catch (error) {
        console.error('Error al cargar el archivo de credenciales:', error);
        throw new Error('No se pudo cargar el archivo de credenciales');
      }
    }
    // Si no hay credenciales de ningún tipo
    else {
      throw new Error('No hay credenciales disponibles para Dialogflow');
    }
  }

  // Método para enviar un mensaje a Dialogflow y obtener la respuesta

  async sendMessage(sessionId: string, text: string) {
    const sessionPath = this.sessionClient.projectAgentSessionPath(
      this.projectId,
      sessionId,
    );

    const request = {
      session: sessionPath,
      queryInput: {
        text: { text, languageCode: 'es' },
      },
    };

    try {
      const responses = await this.sessionClient.detectIntent(request);

      // Definir el tipo explícitamente para evitar retorno inseguro
      if (!responses || !responses[0] || !responses[0].queryResult) {
        throw new Error('No response from Dialogflow');
      }

      return responses[0].queryResult;
    } catch (error) {
      console.error('Error detectando la intención:', error);
      throw new Error('Error detectando la intención');
    }
  }
}
