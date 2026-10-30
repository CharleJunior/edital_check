import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { EditalcheckappService, FirebaseAuthGuard } from './editalcheckapp.service';
import { companySignupDto } from './dto/user.dto';

@Controller('editalcheckapp')
export class EditalcheckappController {
  constructor(private readonly editalcheckappService: EditalcheckappService) { }
  // Rota para buscar dados do usuario pelo seu id
  @Get('consult')
  @UseGuards(FirebaseAuthGuard)
  async consultPerUser(@Req() req: any) {
    const uid = req.user.uid;
    return await this.editalcheckappService.consultPerUser(uid);
  }

  // Rota para cadastrar a empresa de um usuário
  @Post('signup')
  async signup(@Body() body: companySignupDto & { userId: string }) {
    return await this.editalcheckappService.companySignup(body);
  }
}
