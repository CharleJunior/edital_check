"use client";

import { useState } from "react";
import { documentos, type Status } from "@/data/documentos";

// Cor de cada status(ausente / regular /  vence em breve e vencido)
const cores: Record<Status, string> = {
  Regular: "bg-blue-100 text-blue-800",
  "Vence em breve": "bg-blue-300 text-blue-900",
  Vencido: "bg-blue-800 text-white",
  Ausente: "bg-white text-blue-800 border border-blue-300",
};

const filtros: Array<Status | "Todos"> = [
  "Todos",
  "Regular",
  "Vence em breve",
  "Vencido",
  "Ausente",
];

export default function HabilitacaoPage() {
  // Guarda o filtro escolhido, ao clicar no filtro a tela atualiza
  const [filtro, setFiltro] = useState<Status | "Todos">("Todos");

  const regulares = documentos.filter((d) => d.status === "Regular").length;
  const vencemEmBreve = documentos.filter((d) => d.status === "Vence em breve").length;
  const vencidos = documentos.filter((d) => d.status === "Vencido").length;
  const ausentes = documentos.filter((d) => d.status === "Ausente").length;

  // Documentos que estão para vencer, e precisa de atenção
  const atencao = documentos.filter(
    (d) => d.status === "Vencido" || d.status === "Vence em breve",
  );

  // Lista mostrada na tela de acordo com o filtro
  const lista =
    filtro === "Todos"
      ? documentos
      : documentos.filter((d) => d.status === filtro);

  return (
    <div>
      <h1 className="text-2xl font-bold">Central de Habilitação</h1>
      <p className="mb-6 text-blue-700">
        Acompanhe a validade dos documentos da empresa.
      </p>

      {/* blocos no topo com os números */}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-5">
        <Quadro titulo="Monitorados" valor={documentos.length} />
        <Quadro titulo="Regulares" valor={regulares} />
        <Quadro titulo="Vencem em 30 dias" valor={vencemEmBreve} />
        <Quadro titulo="Vencidos" valor={vencidos} />
        <Quadro titulo="Ausentes" valor={ausentes} />
      </div>

      {/* bloco logo abaixo que mostra documentos proximos a vencer e os que estão vencidos*/}
      {atencao.length > 0 && (
        <div className="mb-6 rounded border border-blue-300 bg-blue-100 p-4">
          <p className="font-bold">Precisa de atenção</p>
          <ul className="mt-2 list-disc pl-5 text-sm">
            {atencao.map((d) => (
              <li key={d.id}>
                {d.nome} ({d.status.toLowerCase()}, validade {d.validade})
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Botões de filtro */}
      <div className="mb-4 flex flex-wrap gap-2">
        {filtros.map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={
              filtro === f
                ? "rounded bg-blue-700 px-3 py-1 text-sm text-white"
                : "rounded border border-blue-300 bg-white px-3 py-1 text-sm hover:bg-blue-100"
            }
          >
            {f}
          </button>
        ))}
      </div>

      {/* Lista de documentos */}
      {lista.length === 0 ? (
        <p>Nenhum documento neste filtro.</p>
      ) : (
        <ul className="space-y-3">
          {lista.map((doc) => (
            <li
              key={doc.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded border border-blue-200 bg-white p-4"
            >
              <div>
                <p className="font-semibold">{doc.nome}</p>
                <p className="text-sm text-blue-700">
                  {doc.categoria} - versão {doc.versao}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm">Validade: {doc.validade}</span>
                <span className={`rounded px-2 py-1 text-xs font-semibold ${cores[doc.status]}`}>
                  {doc.status}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-6 text-xs text-blue-700">
        Documento vencido nem sempre impede a participação: a análise de cada
        edital considera o tipo do documento e quando ele precisa ser
        comprovado.
      </p>
    </div>
  );
}

// bloco com um título e um número
function Quadro({ titulo, valor }: { titulo: string; valor: number }) {
  return (
    <div className="rounded border border-blue-200 bg-white p-3">
      <p className="text-xs text-blue-700">{titulo}</p>
      <p className="text-2xl font-bold">{valor}</p>
    </div>
  );
}
