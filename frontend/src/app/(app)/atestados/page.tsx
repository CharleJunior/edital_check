"use client";

import { useState } from "react";

type Atestado = {
  id: number;
  tipoServico: string;
  escopo: string;
  quantidade: number;
  unidade: string;
  valor: number;
  meses: number;
  contratante: string;
  atividades: string;
  complexidade: string;
};

const iniciais: Atestado[] = [
  {
    id: 1,
    tipoServico: "Desenvolvimento de software",
    escopo: "Web, API e mobile",
    quantidade: 320,
    unidade: "usuários",
    valor: 180000,
    meses: 12,
    contratante: "Município X",
    atividades: "Implantação e suporte",
    complexidade: "Média",
  },
  {
    id: 2,
    tipoServico: "Desenvolvimento de software",
    escopo: "Sistema web",
    quantidade: 250,
    unidade: "usuários",
    valor: 95000,
    meses: 8,
    contratante: "Secretaria Y",
    atividades: "Implantação",
    complexidade: "Baixa",
  },
];

const vazio = {
  tipoServico: "",
  escopo: "",
  quantidade: "",
  unidade: "",
  valor: "",
  meses: "",
  contratante: "",
  atividades: "",
  complexidade: "Média",
};

const dinheiro = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// Ponto de ligação com o back: troque o corpo quando a rota de atestados existir.
async function salvarNoBack(a: Atestado): Promise<void> {
  void a;
}

export default function AtestadosPage() {
  const [lista, setLista] = useState<Atestado[]>(iniciais);
  const [form, setForm] = useState(vazio);
  const [erro, setErro] = useState("");
  const [ok, setOk] = useState("");

  function mudar(campo: keyof typeof vazio, valor: string) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  async function adicionar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setOk("");
    if (!form.tipoServico.trim()) return setErro("Informe o tipo de serviço.");
    if (!form.contratante.trim()) return setErro("Informe o contratante.");
    if (!(Number(form.quantidade) > 0)) return setErro("Informe a quantidade comprovada.");
    if (!form.unidade.trim()) return setErro("Informe a unidade (ex.: usuários, unidades).");

    const novo: Atestado = {
      id: Date.now(),
      tipoServico: form.tipoServico.trim(),
      escopo: form.escopo.trim(),
      quantidade: Number(form.quantidade),
      unidade: form.unidade.trim(),
      valor: Number(form.valor) || 0,
      meses: Number(form.meses) || 0,
      contratante: form.contratante.trim(),
      atividades: form.atividades.trim(),
      complexidade: form.complexidade,
    };
    await salvarNoBack(novo);
    setLista((l) => [...l, novo]);
    setForm(vazio);
    setOk("Atestado cadastrado (teste: ainda não vai para o back).");
  }

  const somatorio = new Map<string, number>();
  for (const a of lista) {
    const chave = `${a.tipoServico} (${a.unidade})`;
    somatorio.set(chave, (somatorio.get(chave) ?? 0) + a.quantidade);
  }

  const campo =
    "w-full rounded border border-blue-300 bg-white px-3 py-2 outline-none focus:border-blue-700";

  return (
    <div>
      <h1 className="text-2xl font-bold">Atestados</h1>
      <p className="mb-6 text-blue-700">
        Atestados provam que a empresa já executou serviços parecidos. Aqui eles ficam
        como dados, não só como PDF.
      </p>
      <div role="status" className="mb-6 rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
        <strong>Modo de demonstração:</strong> os atestados desta tela são mantidos localmente.
        Cadastrar ou remover itens aqui ainda não grava alterações no banco de dados.
      </div>

      <form
        onSubmit={adicionar}
        noValidate
        className="mb-8 grid gap-4 rounded border border-blue-300 bg-white p-4 sm:grid-cols-2"
      >
        <label className="block text-sm">
          Tipo de serviço *
          <input value={form.tipoServico} onChange={(e) => mudar("tipoServico", e.target.value)} className={campo} />
        </label>
        <label className="block text-sm">
          Escopo / tecnologias
          <input value={form.escopo} onChange={(e) => mudar("escopo", e.target.value)} className={campo} />
        </label>
        <label className="block text-sm">
          Quantidade comprovada *
          <input type="number" min={0} value={form.quantidade} onChange={(e) => mudar("quantidade", e.target.value)} className={campo} />
        </label>
        <label className="block text-sm">
          Unidade *
          <input value={form.unidade} onChange={(e) => mudar("unidade", e.target.value)} className={campo} />
        </label>
        <label className="block text-sm">
          Valor (R$)
          <input type="number" min={0} value={form.valor} onChange={(e) => mudar("valor", e.target.value)} className={campo} />
        </label>
        <label className="block text-sm">
          Período (meses)
          <input type="number" min={0} value={form.meses} onChange={(e) => mudar("meses", e.target.value)} className={campo} />
        </label>
        <label className="block text-sm">
          Contratante *
          <input value={form.contratante} onChange={(e) => mudar("contratante", e.target.value)} className={campo} />
        </label>
        <label className="block text-sm">
          Complexidade
          <select value={form.complexidade} onChange={(e) => mudar("complexidade", e.target.value)} className={campo}>
            <option>Baixa</option>
            <option>Média</option>
            <option>Alta</option>
          </select>
        </label>
        <label className="block text-sm sm:col-span-2">
          Atividades realizadas
          <input value={form.atividades} onChange={(e) => mudar("atividades", e.target.value)} className={campo} />
        </label>

        {erro && (
          <p role="alert" className="text-sm font-medium sm:col-span-2">
            {erro}
          </p>
        )}
        {ok && <p className="text-sm text-blue-700 sm:col-span-2">{ok}</p>}

        <button
          type="submit"
          className="rounded bg-blue-700 py-2 font-medium text-white hover:bg-blue-800 sm:col-span-2"
        >
          Cadastrar atestado
        </button>
      </form>

      <h2 className="mb-2 text-lg font-semibold">Quantidade total comprovada</h2>
      <p className="mb-3 text-sm text-blue-700">
        Soma dos atestados do mesmo serviço. Se o edital permite somar atestados, é esse
        total que conta (RN-004).
      </p>
      <ul className="mb-8 space-y-1">
        {[...somatorio].map(([chave, total]) => (
          <li key={chave} className="rounded bg-blue-100 px-3 py-2 text-sm">
            {chave}: <strong>{total}</strong>
          </li>
        ))}
      </ul>

      <h2 className="mb-3 text-lg font-semibold">Cadastrados ({lista.length})</h2>
      <ul className="space-y-3">
        {lista.map((a) => (
          <li key={a.id} className="rounded border border-blue-300 bg-white p-4">
            <div className="flex flex-wrap items-start gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-medium">{a.tipoServico}</p>
                <p className="text-sm text-blue-700">
                  {a.escopo && `${a.escopo} · `}
                  {a.quantidade} {a.unidade}
                  {a.valor > 0 && ` · ${dinheiro(a.valor)}`}
                  {a.meses > 0 && ` · ${a.meses} meses`}
                </p>
                <p className="text-sm text-blue-700">
                  {a.contratante}
                  {a.atividades && ` · ${a.atividades}`}
                </p>
              </div>
              <span className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                Complexidade {a.complexidade.toLowerCase()}
              </span>
              <button
                onClick={() => setLista((l) => l.filter((x) => x.id !== a.id))}
                className="text-sm underline hover:text-blue-700"
              >
                Remover
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
