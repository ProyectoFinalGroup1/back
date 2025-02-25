import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ChatbotRequestDto {
  @ApiProperty({
    description:
      'ID de sesión único para mantener el contexto de la conversación',
    example: 'session-123456',
  })
  @IsNotEmpty()
  @IsString()
  sessionId: string;

  @ApiProperty({
    description: 'Mensaje del usuario al chatbot',
    example: '¿Cuáles son los horarios de visita?',
  })
  @IsNotEmpty()
  @IsString()
  message: string;
}
