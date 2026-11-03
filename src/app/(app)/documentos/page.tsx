"use client";

import { useEffect, useState } from "react";
import {
  coresStatus,
  formatarDataBR,
  statusPorValidade,
} from "@/lib/validade";

type Doc = {
  id: number;
  tipo: string;
  categoria: string;
  versao: number;
  validade: string;
};

const tipos = [
  { nome: "Certidão Negativa de Débitos Federais", categoria: "Fiscal" },
  { nome: "Certificado de Regularidade do FGTS", categoria: "Fiscal" },
  { nome: "Certidão Negativa de Débitos Trabalhistas", categoria: "Trabalhista" },
  { nome: "Certidão Negativa Estadual", categoria: "Fiscal" },
  { nome: "Certidão Negativa Municipal", categoria: "Fiscal" },
  { nome: "Certidão de Falência e Recuperação Judicial", categoria: "Jurídica" },
  { nome: "Balanço Patrimonial", categoria: "Econômico-financeira" },
  { nome: "Cadastro no SICAF", categoria: "Jurídica" },
];

const categorias = ["Fiscal", "Trabalhista", "Jurídica", "Econômico-financeira", "Técnica"];

const iniciais: Doc[] = [
  { id: 1, tipo: "Certidão Negativa de Débitos Federais", categoria: "Fiscal", versao: 3, validade: "2027-02-20" },
  { id: 2, tipo: "Certificado de Regularidade do FGTS", categoria: "Fiscal", versao: 5, validade: "2026-12-31" },
  { id: 3, tipo: "Certidão Negativa Municipal", categoria: "Fiscal", versao: 2, validade: "2026-10-11" },
];

// Ponto de ligação com o back: troque o corpo quando a rota de salvar documento existir.
async function salvarNoBack(doc: Doc): Promise<void> {
  void doc;
}

export default function DocumentosPage() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    Promise.resolve().then(() => {
      setDocs(iniciais);
      setCarregado(true);
    });
  }, []);

  const [tipo, setTipo] = useState(tipos[0].nome);
  const [categoria, setCategoria] = useState(tipos[0].categoria);
  const [versao, setVersao] = useState("4");
  const [validade, setValidade] = useState("");
  const [erro, setErro] = useState("");
  const [ok, setOk] = useState("");

  function proximaVersao(nome: string, lista: Doc[]) {
    const versoes = lista.filter((d) => d.tipo === nome).map((d) => d.versao);
    return String(versoes.length ? Math.max(...versoes) + 1 : 1);
  }

  function escolherTipo(nome: string) {
    setTipo(nome);
    setCategoria(tipos.find((t) => t.nome === nome)?.categoria ?? categoria);
    setVersao(proximaVersao(nome, docs));
  }

  async function adicionar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setOk("");
    if (!validade) return setErro("Informe a data de validade.");
    if (!Number.isInteger(Number(versao)) || Number(versao) < 1)
      return setErro("A versão precisa ser um número inteiro, a partir de 1.");

    const novo: Doc = {
      id: Date.now(),
      tipo,
      categoria,
      versao: Number(versao),
      validade,
    };
    await salvarNoBack(novo);
    const lista = [...docs, novo];
    setDocs(lista);
    setVersao(proximaVersao(tipo, lista));
    setValidade("");
    setOk("Documento cadastrado (teste: ainda não vai para o back).");
  }

  function remover(id: number) {
    setDocs((lista) => lista.filter((d) => d.id !== id));
  }

  const atuais = tipos
    .map((t) => t.nome)
    .concat(docs.map((d) => d.tipo).filter((n) => !tipos.some((t) => t.nome === n)))
    .filter((nome, i, todos) => todos.indexOf(nome) === i)
    .map((nome) =>
      docs.filter((d) => d.tipo === nome).sort((a, b) => b.versao - a.versao),
    )
    .filter((versoes) => versoes.length > 0);

  const campo =
    "w-full rounded border border-blue-300 bg-white px-3 py-2 outline-none focus:border-blue-700";

  return (
    <div>
      <h1 className="text-2xl font-bold">Documentos</h1>
      <p className="mb-6 text-blue-700">
        Cadastre os documentos da empresa. Cada um precisa de validade e versão.
      </p>

      <form
        onSubmit={adicionar}
        noValidate
        className="mb-8 grid gap-4 rounded border border-blue-300 bg-white p-4 sm:grid-cols-2"
      >
        <label className="block text-sm sm:col-span-2">
          Tipo de documento
          <select value={tipo} onChange={(e) => escolherTipo(e.target.value)} className={campo}>
            {tipos.map((t) => (
              <option key={t.nome}>{t.nome}</option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          Categoria
          <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className={campo}>
            {categorias.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          Versão
          <input
            type="number"
            min={1}
            value={versao}
            onChange={(e) => setVersao(e.target.value)}
            className={campo}
          />
        </label>

        <label className="block text-sm">
          Validade
          <input
            type="date"
            value={validade}
            onChange={(e) => setValidade(e.target.value)}
            className={campo}
          />
        </label>

        <div className="flex items-end">
          <button
            type="submit"
            className="w-full rounded bg-blue-700 py-2 font-medium text-white hover:bg-blue-800"
          >
            Cadastrar documento
          </button>
        </div>

        {erro && (
          <p role="alert" className="text-sm font-medium sm:col-span-2">
            {erro}
          </p>
        )}
        {ok && <p className="text-sm text-blue-700 sm:col-span-2">{ok}</p>}
      </form>

      <h2 className="mb-3 text-lg font-semibold">Cadastrados</h2>
      {carregado && atuais.length === 0 && <p className="text-blue-700">Nenhum documento cadastrado.</p>}

      <ul className="space-y-3">
        {atuais.map(([atual, ...antigas]) => {
          const status = statusPorValidade(atual.validade);
          return (
            <li key={atual.id} className="rounded border border-blue-300 bg-white p-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{atual.tipo}</p>
                  <p className="text-sm text-blue-700">
                    {atual.categoria} · versão {atual.versao} · validade{" "}
                    {formatarDataBR(atual.validade)}
                  </p>
                </div>
                <span className={`rounded px-2 py-1 text-xs font-medium ${coresStatus[status]}`}>
                  {status}
                </span>
                <button
                  onClick={() => remover(atual.id)}
                  className="text-sm underline hover:text-blue-700"
                >
                  Remover
                </button>
              </div>

              {antigas.length > 0 && (
                <details className="mt-2 text-sm text-blue-700">
                  <summary className="cursor-pointer">
                    Histórico ({antigas.length} versão{antigas.length > 1 ? "ões" : ""} anterior
                    {antigas.length > 1 ? "es" : ""})
                  </summary>
                  <ul className="mt-1 space-y-1">
                    {antigas.map((d) => (
                      <li key={d.id}>
                        versão {d.versao} · validade {formatarDataBR(d.validade)}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
