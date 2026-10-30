// imports padrão
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config'

import * as admin from 'firebase-admin';
import * as path from 'path';
// imports locais 
import { User } from './entity/user.entity';
import { companySignupDto } from './dto/user.dto';


@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token de autenticação não fornecido.');
    }

    const token = authHeader.split(' ')[1];

    try {
      const decodedToken = await admin.auth().verifyIdToken(token);

      request.user = decodedToken;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Token inválido ou expirado.');
    }
  }
}

export class EditalcheckappService {

  constructor(private readonly ConfigService: ConfigService) {
    if (!admin.apps.length) {
      const caminhoCredenciais = process.env.GOOGLE_APPLICATION_CREDENTIALS;

      if (!caminhoCredenciais) {
        throw new Error('A variável de ambiente GOOGLE_APPLICATION_CREDENTIALS não foi definida.');
      }

      const caminhoAbsoluto = path.resolve(caminhoCredenciais);

      admin.initializeApp({
        credential: admin.credential.cert(caminhoAbsoluto),
      });
    }
  }


  async companySignup(dados: companySignupDto & { userId: string }) {
    const db = admin.firestore();
    db.settings({ ignoreUndefinedProperties: true });

    const userId = dados.userId;
    if (!userId) {
      throw new Error("userId é obrigatório para salvar os dados.");
    }

    // procura se já existe um documento com este userId
    const snapshot = await db
      .collection('companyInformation')
      .where('userId', '==', userId)
      .get();

    let docRef;

    if (!snapshot.empty) {
      // se já existe, pega o ID do documento atual e atualiza
      const docId = snapshot.docs[0].id;
      docRef = db.collection('companyInformation').doc(docId);

      await docRef.set({
        razaoSocial: dados.razaoSocial || "",
        cnpj: dados.cnpj || "",
        porte: dados.porte || "",
        email: dados.email || "",
        phone: dados.phone || "",
        address: dados.address || "",
        // Mantém certidões se já existirem, ou array vazio
        certidoes: dados.certidoes || snapshot.docs[0].data().certidoes || [],
      }, { merge: true }); // O { merge: true } garante que não apaga campos antigos sem querer

      console.log('Documento atualizado com ID: ', docId);
      return { id: docId, message: 'Atualizado com sucesso!' };

    } else {
      // se não existe nenhuma gaveta para este usuário ainda, cria a primeira com .add()
      const novoDoc = await db.collection('companyInformation').add({
        userId: userId,
        razaoSocial: dados.razaoSocial || "",
        cnpj: dados.cnpj || "",
        porte: dados.porte || "",
        email: dados.email || "",
        phone: dados.phone || "",
        address: dados.address || "",
        certidoes: [],
      });

      console.log('Primeiro documento criado com ID: ', novoDoc.id);
      return { id: novoDoc.id, message: 'Cadastrado com sucesso!' };
    }
  }


  async consultPerUser(uid: string) {
    try {
      const snapshot = await admin.firestore()
        .collection('companyInformation')
        .where('userId', '==', uid)
        .get();

      if (snapshot.empty) {
        return { message: "Nenhum dado encontrado para este usuário" };
      }

      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      throw new Error("Erro ao consultar dados do usuário");
    }
  }

}
