"use client";

import { useEffect, useState } from "react";
import {
  coresStatus,
  formatarDataBR,
  statusPorValidade,
} from "@/lib/validade";
import { buscarDocumentos, removerDocumentoNoBack, salvarDocumentosNoBack } from "@/lib/api";

type Doc = {
  id: string | number;
  tipoDocumento: string;
  categoriaDocumento: string;
  versaoDocumento: number | string;
  validadeDocumento: string;
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

export default function DocumentosPage() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    async function carregarDados() {
      const dadosDoBack = await buscarDocumentos();

      const listaFormatada: Doc[] = [];
      dadosDoBack.forEach((item: any) => {
        if (item.documentos && Array.isArray(item.documentos)) {
          item.documentos.forEach((d: any) => {
            listaFormatada.push({
              id: d.id,
              tipoDocumento: d.tipoDocumento,
              categoriaDocumento: d.categoriaDocumento,
              versaoDocumento: d.versaoDocumento || 1,
              validadeDocumento: d.validadeDocumento,
            });
          });
        }
      });

      setDocs(listaFormatada);
      setCarregado(true);
    }

    carregarDados();
  }, []);

  const [tipo, setTipo] = useState(tipos[0].nome);
  const [categoria, setCategoria] = useState(tipos[0].categoria);
  const [versao, setVersao] = useState("1");
  const [validade, setValidade] = useState("");
  const [erro, setErro] = useState("");
  const [ok, setOk] = useState("");

  function proximaVersao(nome: string, lista: Doc[]) {
    const versoes = lista.filter((d) => d.tipoDocumento === nome).map((d) => Number(d.versaoDocumento));
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

    const novoDocDto = {
      tipoDocumento: tipo,
      categoriaDocumento: categoria,
      versaoDocumento: String(versao),
      validadeDocumento: validade,
    };

    const sucesso = await salvarDocumentosNoBack([novoDocDto]);

    if (!sucesso) {
      return setErro("Erro ao salvar documento no servidor.");
    }

    const dadosDoBack = await buscarDocumentos();
    const listaFormatada: Doc[] = [];
    dadosDoBack.forEach((item: any) => {
      if (item.documentos && Array.isArray(item.documentos)) {
        item.documentos.forEach((d: any) => {
          listaFormatada.push({
            id: d.id,
            tipoDocumento: d.tipoDocumento,
            categoriaDocumento: d.categoriaDocumento,
            versaoDocumento: d.versaoDocumento || 1,
            validadeDocumento: d.validadeDocumento,
          });
        });
      }
    });

    setDocs(listaFormatada);
    setVersao(proximaVersao(tipo, listaFormatada));
    setValidade("");
    setOk("Documento cadastrado e salvo com sucesso no banco!");
  }

  async function remover(idDocumento: string | number) {
    setErro("");
    setOk("");

    const sucesso = await removerDocumentoNoBack(idDocumento);

    if (!sucesso) {
      return setErro("Erro ao remover documento no servidor.");
    }
    setDocs((lista) => lista.filter((d) => d.id !== idDocumento));
    setOk("Documento removido com sucesso.");
  }

  const atuais = tipos
    .map((t) => t.nome)
    .concat(docs.map((d) => d.tipoDocumento).filter((n) => !tipos.some((t) => t.nome === n)))
    .filter((nome, i, todos) => todos.indexOf(nome) === i)
    .map((nome) =>
      docs.filter((d) => d.tipoDocumento === nome).sort((a, b) => Number(b.versaoDocumento) - Number(a.versaoDocumento)),
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
          <p role="alert" className="text-sm font-medium text-red-600 sm:col-span-2">
            {erro}
          </p>
        )}
        {ok && <p className="text-sm text-blue-700 sm:col-span-2">{ok}</p>}
      </form>

      <h2 className="mb-3 text-lg font-semibold">Cadastrados</h2>
      {!carregado && <p className="text-blue-700">Carregando documentos...</p>}
      {carregado && atuais.length === 0 && <p className="text-blue-700">Nenhum documento cadastrado.</p>}

      <ul className="space-y-3">
        {atuais.map(([atual, ...antigas]) => {
          const status = statusPorValidade(atual.validadeDocumento);
          return (
            <li key={atual.id} className="rounded border border-blue-300 bg-white p-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{atual.tipoDocumento}</p>
                  <p className="text-sm text-blue-700">
                    {atual.categoriaDocumento} · versão {atual.versaoDocumento} · validade{" "}
                    {formatarDataBR(atual.validadeDocumento)}
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
                        versão {d.versaoDocumento} · validade {formatarDataBR(d.validadeDocumento)}
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