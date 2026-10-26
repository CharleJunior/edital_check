'use client';

import { useState, useEffect } from "react";
export type Status = "Regular" | "Vence em breve" | "Vencido" | "Ausente";

export type Document = {
  id: number | string;
  nome: string;
  categoria: string;
  versao: number;
  validade: string;
  status: Status;
};

// buscar os dados do Firestore
async function fetchDocumentsFromApi(): Promise<Document[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  try {
    const response = await fetch(`${baseUrl}/consult`);


    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error("O backend não retornou um JSON válido.");
    }

    const data = await response.json();

    const empresa = Array.isArray(data) ? data[0] : data;
    const certidoesDoBanco = empresa?.certidoes || [];

    return certidoesDoBanco.map((cert: any, index: number) => ({
      id: index + 1,
      nome: cert.tipo || 'Documento sem nome',
      categoria: 'Fiscal',
      versao: 1,
      validade: cert.validade || 'Não informada',
      status: cert.status === 'valido' ? 'Regular' : 'Ausente',
    }));
  } catch (error) {
    console.error('Erro ao buscar documents:', error);
    return [];
  }
}

export { fetchDocumentsFromApi as SearchDocuments };

// DADOS DE TESTE
// export const documentos: Document[] = [
//   { id: 1, nome: "Certidão Negativa de Débitos Federais", categoria: "Fiscal", versao: 3, validade: "20/02/2027", status: "Regular" },
//   { id: 2, nome: "Certificado de Regularidade do FGTS", categoria: "Fiscal", versao: 5, validade: "31/10/2026", status: "Vence em breve" },
//   { id: 3, nome: "Certidão Negativa de Débitos Trabalhistas", categoria: "Trabalhista", versao: 2, validade: "06/01/2027", status: "Regular" },
//   { id: 4, nome: "Certidão Negativa Estadual", categoria: "Fiscal", versao: 1, validade: "14/11/2026", status: "Vence em breve" },
//   { id: 5, nome: "Certidão Negativa Municipal", categoria: "Fiscal", versao: 2, validade: "11/10/2026", status: "Vencido" },
//   { id: 6, nome: "Certidão de Falência e Recuperação Judicial", categoria: "Jurídica", versao: 1, validade: "02/12/2026", status: "Regular" },
//   { id: 7, nome: "Balanço Patrimonial 2025", categoria: "Econômico-financeira", versao: 1, validade: "11/05/2027", status: "Regular" },
//   { id: 8, nome: "Balanço Patrimonial 2026", categoria: "Econômico-financeira", versao: 1, validade: "Não cadastrado", status: "Ausente" },
//   { id: 9, nome: "Cadastro no SICAF", categoria: "Jurídica", versao: 1, validade: "21/04/2027", status: "Regular" },
// ];
