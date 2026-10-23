import { Controller, Get } from '@nestjs/common';
import { EditalcheckappService } from './editalcheckapp.service';

@Controller('editalcheckapp')
export class EditalcheckappController {
  constructor(private readonly editalcheckappService: EditalcheckappService) { }
  @Get('login')
  loginTest() {
    return this.editalcheckappService.provisionalLogin();
  }
}
