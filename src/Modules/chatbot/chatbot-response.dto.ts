import { ApiProperty } from '@nestjs/swagger';

export class ChatbotResponseDto {
  @ApiProperty({
    description: 'Texto de respuesta del chatbot',
    example:
      'Nuestros horarios de visita son de 8:00 AM a 6:00 PM todos los días.',
  })
  responseText: string;

  @ApiProperty({
    description: 'Intent detectado (opcional)',
    example: 'horarios-visita',
    required: false,
  })
  intent?: string;

  @ApiProperty({
    description: 'Nivel de confianza en la detección del intent (opcional)',
    example: 0.85,
    required: false,
  })
  confidence?: number;
}
