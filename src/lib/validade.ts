export type StatusValidade = "Regular" | "Vence em breve" | "Vencido";

export function formatarDataBR(iso: string): string {
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

export function statusPorValidade(iso: string): StatusValidade {
  const [ano, mes, dia] = iso.split("-").map(Number);
  const hoje = new Date();
  const inicioDeHoje = Date.UTC(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  const dias = Math.round((Date.UTC(ano, mes - 1, dia) - inicioDeHoje) / 86400000);

  if (dias < 0) return "Vencido";
  return dias <= 30 ? "Vence em breve" : "Regular";
}

export const coresStatus: Record<StatusValidade, string> = {
  Regular: "bg-blue-100 text-blue-800",
  "Vence em breve": "bg-blue-300 text-blue-900",
  Vencido: "bg-blue-800 text-white",
};
