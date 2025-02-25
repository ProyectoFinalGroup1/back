import { Controller, Post, Body } from '@nestjs/common';
import { DialogflowService } from './dialogflow.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ChatbotResponseDto } from './chatbot-response.dto';
import { ChatbotRequestDto } from './chatbot-request.dto';

@ApiTags('Dialogflow')
@Controller('dialogflow')
export class DialogflowController {
  constructor(private readonly dialogflowService: DialogflowService) {}
  @Post('send-message')
  @ApiOperation({ summary: 'Enviar mensaje al chatbot' })
  @ApiResponse({
    status: 200,
    description: 'Mensaje procesado exitosamente',
    type: ChatbotResponseDto,
  })
  async sendMessage(
    @Body() body: ChatbotRequestDto,
  ): Promise<ChatbotResponseDto> {
    try {
      const response = await this.dialogflowService.sendMessage(
        body.sessionId,
        body.message,
      );

      if (!response || !response.fulfillmentText) {
        return { responseText: 'No response from Dialogflow' };
      }

      return {
        responseText: response.fulfillmentText,
        intent: response.intent?.displayName || undefined,
        confidence: response.intentDetectionConfidence ?? undefined,
      };
    } catch (error) {
      console.error('Error sending message to Dialogflow:', error);
      throw new Error('Error sending message to Dialogflow');
    }
  }
}
