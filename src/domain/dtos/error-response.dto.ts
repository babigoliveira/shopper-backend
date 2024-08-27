import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty()
  error_code: string;

  @ApiProperty()
  error_description: string;
}
