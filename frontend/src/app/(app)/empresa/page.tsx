"use client";

import { useState } from "react";

// Os campos do formulário. Os nomes seguem a entidade CompanyInformation
// do back (companyName, cnpj, address, phone, email), mais o porte.
const formularioVazio = {
  companyName: "",
  cnpj: "",
  porte: "",
  email: "",
  phone: "",
  address: "",
};

// Deixa só os números e coloca a pontuação: 00.000.000/0000-00
function formatarCnpj(valor: string): string {
  const n = valor.replace(/\D/g, "").slice(0, 14);
  return n
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

export default function EmpresaPage() {
  // Tudo o que a pessoa digitou fica guardado aqui.
  const [form, setForm] = useState(formularioVazio);
  const [erros, setErros] = useState<string[]>([]);
  const [salvo, setSalvo] = useState(false);

  // Roda a cada letra digitada. Serve para todos os campos:
  // o "name" de cada campo diz qual item do formulário mudar.
  function mudar(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === "cnpj" ? formatarCnpj(value) : value });
    setSalvo(false);
  }

  // Roda ao clicar em "Salvar".
  function salvar(e: React.FormEvent) {
    e.preventDefault(); // impede a página de recarregar

    const problemas: string[] = [];
    if (form.companyName.trim() === "") {
      problemas.push("Informe a razão social.");
    }
    if (form.cnpj.replace(/\D/g, "").length !== 14) {
      problemas.push("O CNPJ precisa ter 14 números.");
    }
    if (form.porte === "") {
      problemas.push("Escolha o porte da empresa.");
    }
    if (form.email !== "" && !form.email.includes("@")) {
      problemas.push("O e-mail parece estar incompleto.");
    }

    setErros(problemas);
    // Por enquanto só mostramos a mensagem. Com o back pronto,
    // é aqui que os dados serão enviados para a API.
    setSalvo(problemas.length === 0);
  }

  const campo =
    "mt-1 w-full rounded border border-blue-300 bg-white px-3 py-2 text-sm";

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold">Empresa</h1>
      <p className="mb-6 text-blue-700">
        Os dados da empresa alimentam todas as análises de editais.
      </p>

      <form noValidate onSubmit={salvar} className="space-y-4 rounded border border-blue-200 bg-white p-5">
        <div>
          <label htmlFor="companyName" className="text-sm font-semibold">
            Razão social *
          </label>
          <input id="companyName" name="companyName" value={form.companyName} onChange={mudar} className={campo} />
        </div>

        <div>
          <label htmlFor="cnpj" className="text-sm font-semibold">
            CNPJ *
          </label>
          <input id="cnpj" name="cnpj" value={form.cnpj} onChange={mudar} placeholder="00.000.000/0000-00" className={campo} />
        </div>

        <div>
          <label htmlFor="porte" className="text-sm font-semibold">
            Porte *
          </label>
          <select id="porte" name="porte" value={form.porte} onChange={mudar} className={campo}>
            <option value="">Selecione...</option>
            <option value="MEI">MEI (microempreendedor individual)</option>
            <option value="ME">ME (microempresa)</option>
            <option value="EPP">EPP (empresa de pequeno porte)</option>
            <option value="OUTRO">Outro (médio ou grande porte)</option>
          </select>
          <p className="mt-1 text-xs text-blue-700">
            ME e EPP têm vantagens legais em algumas licitações.
          </p>
        </div>

        <div>
          <label htmlFor="email" className="text-sm font-semibold">
            E-mail
          </label>
          <input id="email" name="email" type="email" value={form.email} onChange={mudar} className={campo} />
        </div>

        <div>
          <label htmlFor="phone" className="text-sm font-semibold">
            Telefone
          </label>
          <input id="phone" name="phone" value={form.phone} onChange={mudar} className={campo} />
        </div>

        <div>
          <label htmlFor="address" className="text-sm font-semibold">
            Endereço
          </label>
          <input id="address" name="address" value={form.address} onChange={mudar} className={campo} />
        </div>

        {erros.length > 0 && (
          <ul className="list-disc rounded border border-blue-300 bg-blue-100 p-3 pl-8 text-sm">
            {erros.map((erro) => (
              <li key={erro}>{erro}</li>
            ))}
          </ul>
        )}

        {salvo && (
          <p className="rounded border border-blue-300 bg-blue-100 p-3 text-sm font-semibold">
            Dados salvos (teste: ainda não vão para o back).
          </p>
        )}

        <button type="submit" className="rounded bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">
          Salvar
        </button>
      </form>
    </div>
  );
}
