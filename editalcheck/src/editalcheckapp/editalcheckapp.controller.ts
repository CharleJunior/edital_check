import { Controller, Get, Post, Body, Req, UseGuards, Param, Delete, UnauthorizedException } from '@nestjs/common';
import { EditalcheckappService, FirebaseAuthGuard } from './editalcheckapp.service';
import { companyDocDto, companySignupDto } from './dto/company.dto';

@Controller('editalcheckapp')
@UseGuards(FirebaseAuthGuard)
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

  // Rota para adicionar documentos de uma empresa 
  @Post('add-docs')
  async addDocs(@Body() body: { docs: companyDocDto[]; userId: string }) {
    const { userId, docs } = body;

    return await this.editalcheckappService.addDocs({ userId, documentos: docs });
  }

  // Rota para adicionar atestados de uma empresa
  @Post('add-atestados')
  async addAtestados(@Body() body: { atestados: any[]; userId: string }) {
    const { userId, atestados } = body;

    return await this.editalcheckappService.addAtestados({ userId, atestados });
  }

  // Rota para remover Atestado por id
  @Delete('atestados/:id')
  async removerAtestado(@Req() req: any, @Param('id') id: string) {
    const userId = req.user?.uid;
    if (!userId) {
      throw new UnauthorizedException('Token inválido ou usuário não autenticado.');
    }
    return await this.editalcheckappService.removerItemPorId(userId, 'atestados', id);
  }

  // Rota para remover Documento por id
  @Delete('documentos/:id')
  async removerDocumento(@Req() req: any, @Param('id') id: string) {
    const userId = req.user?.uid;
    if (!userId) {
      throw new UnauthorizedException('Token inválido ou usuário não autenticado.');
    }
    return await this.editalcheckappService.removerItemPorId(userId, 'documentos', id);
  }
}
