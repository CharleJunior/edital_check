import { buscarEmpresa, type Certidao } from "@/lib/api";

export type Status = "Regular" | "Vence em breve" | "Vencido" | "Ausente";

export type Documento = {
  id: number;
  nome: string;
  categoria: string;
  versao: number;
  validade: string;
  status: Status;
};

export const documentosDeTeste: Documento[] = [
  { id: 1, nome: "Certidão Negativa de Débitos Federais", categoria: "Fiscal", versao: 3, validade: "20/02/2027", status: "Regular" },
  { id: 2, nome: "Certificado de Regularidade do FGTS", categoria: "Fiscal", versao: 5, validade: "31/10/2026", status: "Vence em breve" },
  { id: 3, nome: "Certidão Negativa de Débitos Trabalhistas", categoria: "Trabalhista", versao: 2, validade: "06/01/2027", status: "Regular" },
  { id: 4, nome: "Certidão Negativa Estadual", categoria: "Fiscal", versao: 1, validade: "14/11/2026", status: "Vence em breve" },
  { id: 5, nome: "Certidão Negativa Municipal", categoria: "Fiscal", versao: 2, validade: "11/10/2026", status: "Vencido" },
  { id: 6, nome: "Certidão de Falência e Recuperação Judicial", categoria: "Jurídica", versao: 1, validade: "02/12/2026", status: "Regular" },
  { id: 7, nome: "Balanço Patrimonial 2025", categoria: "Econômico-financeira", versao: 1, validade: "11/05/2027", status: "Regular" },
  { id: 8, nome: "Balanço Patrimonial 2026", categoria: "Econômico-financeira", versao: 1, validade: "Não cadastrado", status: "Ausente" },
  { id: 9, nome: "Cadastro no SICAF", categoria: "Jurídica", versao: 1, validade: "21/04/2027", status: "Regular" },
];

// Aceita "AAAA-MM-DD" e "DD/MM/AAAA".
function lerData(texto?: string): Date | null {
  if (!texto) return null;
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(texto);
  const br = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(texto);
  if (iso) return new Date(Date.UTC(+iso[1], +iso[2] - 1, +iso[3]));
  if (br) return new Date(Date.UTC(+br[3], +br[2] - 1, +br[1]));
  return null;
}

function formatarData(texto?: string): string {
  const data = lerData(texto);
  if (!data) return texto || "Não informada";
  const dia = String(data.getUTCDate()).padStart(2, "0");
  const mes = String(data.getUTCMonth() + 1).padStart(2, "0");
  return `${dia}/${mes}/${data.getUTCFullYear()}`;
}

function calcularStatus(cert: Certidao): Status {
  const validade = lerData(cert.validade);
  if (!validade) return cert.status === "valido" ? "Regular" : "Ausente";

  const hoje = new Date();
  const inicioDeHoje = Date.UTC(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  const dias = Math.round((validade.getTime() - inicioDeHoje) / 86400000);

  if (dias < 0) return "Vencido";
  return dias <= 30 ? "Vence em breve" : "Regular";
}

export type ResultadoDocumentos = {
  documentos: Documento[];
  origem: "api" | "teste";
};

export async function buscarDocumentos(): Promise<ResultadoDocumentos> {
  const empresa = await buscarEmpresa();
  if (!empresa) return { documentos: documentosDeTeste, origem: "teste" };

  const documentos = (empresa.certidoes ?? []).map((cert, i) => ({
    id: i + 1,
    nome: cert.tipo || "Documento sem nome",
    categoria: "Fiscal",
    versao: 1,
    validade: formatarData(cert.validade),
    status: calcularStatus(cert),
  }));
  return { documentos, origem: "api" };
}
