// imports padrão
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config'

// imports do firebase
import * as path from 'path';
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth';
import { DocumentReference, FieldValue, getFirestore, QueryDocumentSnapshot } from 'firebase-admin/firestore';

// imports locais 
import { companySignupDto, companyDocDto, companyAtestadosDto } from './dto/company.dto';
import { array } from 'firebase/firestore/lite/pipelines';


@Injectable()
// authguard para proteção e autenticação com Firebase
export class FirebaseAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token de autenticação não fornecido.');
    }

    const token = authHeader.split(' ')[1];

    try {
      const decodedToken = await getAuth().verifyIdToken(token);

      request.user = decodedToken;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Token inválido ou expirado.');
    }
  }
}

export class EditalcheckappService {
  // configurações do Firebase
  constructor(private readonly ConfigService: ConfigService) {

    if (!getApps().length) {
      const caminhoCredenciais = process.env.GOOGLE_APPLICATION_CREDENTIALS;

      if (!caminhoCredenciais) {
        throw new Error('A variável de ambiente GOOGLE_APPLICATION_CREDENTIALS não foi definida.');
      }

      const caminhoAbsoluto = path.resolve(caminhoCredenciais);

      initializeApp({
        credential: cert(caminhoAbsoluto),
      });
    }

    getFirestore().settings({ ignoreUndefinedProperties: true });
  }

  // inicio do codigo principal
  private collectionName = 'companyInformation'; // nome da coleção no Firestore

  private async obterReferenciaEmpresaPorUsuario(userId: string, collectionName: string): Promise<DocumentReference> {
    // função auxiliar para obter a referência do documento da empresa pelo userId
    if (!userId) {
      throw new Error("userId é obrigatório.");
    }

    const db = getFirestore();
    const snapshot = await db
      .collection(collectionName)
      .where('userId', '==', userId)
      .limit(1)
      .get();

    if (snapshot.empty) {
      throw new Error("Empresa não encontrada para este usuário.");
    }

    return snapshot.docs[0].ref; //retorna a referência do documento da empresa
  }


  async companySignup(dados: companySignupDto & { userId: string }) {
    const db = getFirestore();
    const collectionName = this.collectionName;

    try {
      // chamada da função auxiliar para obter a referência do documento da empresa pelo userId
      const docRef = await this.obterReferenciaEmpresaPorUsuario(dados.userId, collectionName);

      // se achar, atualiza
      await docRef.set({
        razaoSocial: dados.razaoSocial || "",
        cnpj: dados.cnpj || "",
        porte: dados.porte || "",
        email: dados.email || "",
        phone: dados.phone || "",
        address: dados.address || "",
        ...(dados.certidoes && { certidoes: dados.certidoes }), // só atualiza certidões se enviadas
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      return { id: docRef.id, message: 'Atualizado com sucesso!' };

    } catch (error) {
      //se a função auxiliar lançou o erro de "Empresa não encontrada", cria um novo registro
      const novoDoc = await db.collection(collectionName).add({
        userId: dados.userId,
        razaoSocial: dados.razaoSocial || "",
        cnpj: dados.cnpj || "",
        porte: dados.porte || "",
        email: dados.email || "",
        phone: dados.phone || "",
        address: dados.address || "",
        certidoes: dados.certidoes || [],
        createdAt: new Date().toISOString(),
      });

      return { id: novoDoc.id, message: 'Cadastrado com sucesso!' };
    }
  }



  async addDocs(dados: { userId: string; documentos: companyDocDto[] }) {
    const userId = dados.userId;

    if (!userId) {
      throw new Error("userId é obrigatório para salvar os dados.");
    }

    const collectionName = this.collectionName;
    const docRef = await this.obterReferenciaEmpresaPorUsuario(dados.userId, collectionName);

    const novosDocumentos = dados.documentos.map(doc => ({
      // gera id único para cada atestado, pois o Firestore não gera automaticamente para subdocumentos em arrays
      id: (doc as any).id || Date.now().toString() + Math.random().toString(36).substring(2, 7),
      tipoDocumento: doc.tipoDocumento || "",
      categoriaDocumento: doc.categoriaDocumento || "",
      versaoDocumento: doc.versaoDocumento || "",
      validadeDocumento: doc.validadeDocumento || "",
    }));

    await docRef.update({
      documentos: FieldValue.arrayUnion(...novosDocumentos),
      updatedAt: new Date().toISOString(),
    });

    return { message: 'Documentos salvos com sucesso na empresa!' };
  }

  async addAtestados(dados: { userId: string; atestados: companyAtestadosDto[] }) {
    const userId = dados.userId;

    if (!userId) {
      throw new Error("userId é obrigatório para salvar os dados.");
    }

    const collectionName = this.collectionName;
    const docRef = await this.obterReferenciaEmpresaPorUsuario(dados.userId, collectionName);

    const novosAtestados = dados.atestados.map(atest => ({

      id: (atest as any).id || Date.now().toString() + Math.random().toString(36).substring(2, 7),
      tipoServico: atest.tipoServico || "",
      escopo: atest.escopo || "",
      quantidadeComprovada: atest.quantidadeComprovada || 0,
      valor: atest.valor || 0,
      unidade: atest.unidade || "",
      periodoMeses: atest.periodoMeses || 0,
      complexidade: atest.complexidade || "",
      contratante: atest.contratante || "",
      atividadesRealizadas: atest.atividadesRealizadas || "",
    }));

    await docRef.update({
      atestados: FieldValue.arrayUnion(...novosAtestados),
      updatedAt: new Date().toISOString(),
    });
  }

  async consultPerUser(uid: string) {
    try {
      const collectionName = this.collectionName;
      const snapshot = await getFirestore()
        .collection(collectionName)
        .where('userId', '==', uid)
        .get();

      if (snapshot.empty) {
        return { message: "Nenhum dado encontrado para este usuário" };
      }

      return snapshot.docs.map((doc: QueryDocumentSnapshot) => ({
        id: doc.id,
        ...doc.data()
      }));

    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      throw new Error("Erro ao consultar dados do usuário");
    }
  }

  async removerItemPorId(userId: string, tipo: 'atestados' | 'documentos', idItem: string) {
    const docRef = await this.obterReferenciaEmpresaPorUsuario(userId, this.collectionName);

    const docSnapshot = await docRef.get();
    if (!docSnapshot.exists) {
      throw new NotFoundException('Empresa não encontrada.');
    }

    const dadosEmpresa = docSnapshot.data();
    const listaAtual = dadosEmpresa?.[tipo] || [];

    // filtra removendo o item que possui o  correspondente
    const novaLista = listaAtual.filter(
      (item: any) => String(item.id) !== String(idItem)
    );

    // atualiza o Firestore substituindo o array correto (atestados ou documentos)
    await docRef.update({
      [tipo]: novaLista,
      updatedAt: new Date().toISOString(),
    });

    return { sucesso: true, mensagem: `${tipo === 'atestados' ? 'Atestado' : 'Documento'} removido com sucesso do banco.` };
  }
}
