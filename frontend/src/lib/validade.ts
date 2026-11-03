export type StatusValidade = "Regular" | "Vence em breve" | "Vencido";

/** Converte uma data ISO (AAAA-MM-DD) para DD/MM/AAAA. */
export function formatarDataBR(iso: string): string {
  if (!iso) return "Não informada";
  const [ano, mes, dia] = iso.split("-");
  if (!ano || !mes || !dia) return iso;
  return `${dia}/${mes}/${ano}`;
}

/** Classifica uma data ISO de validade considerando o dia local atual. */
export function statusPorValidade(iso: string): StatusValidade {
  const [ano, mes, dia] = iso.split("-").map(Number);
  if (!ano || !mes || !dia) return "Vencido";

  const hoje = new Date();
  const inicioDeHoje = Date.UTC(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  const dataValidade = Date.UTC(ano, mes - 1, dia);
  const dias = Math.round((dataValidade - inicioDeHoje) / 86400000);

  if (dias < 0) return "Vencido";
  return dias <= 30 ? "Vence em breve" : "Regular";
}

export const coresStatus: Record<StatusValidade, string> = {
  Regular: "bg-blue-100 text-blue-800",
  "Vence em breve": "bg-blue-300 text-blue-900",
  Vencido: "bg-blue-800 text-white",
};
