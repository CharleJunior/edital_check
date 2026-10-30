"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { buscarEmpresa } from "@/lib/api"; // <-- Importa a função que busca no back

const formularioVazio = {
  razaoSocial: "",
  cnpj: "",
  porte: "",
  email: "",
  phone: "",
  address: "",
};

function formatarCnpj(valor: string): string {
  const n = valor.replace(/\D/g, "").slice(0, 14);
  return n
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

export default function EmpresaPage() {
  const router = useRouter();
  const [form, setForm] = useState(formularioVazio);
  const [erros, setErros] = useState<string[]>([]);
  const [salvo, setSalvo] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [userUid, setUserUid] = useState<string | null>(null);

  // 1. Protege a rota e BUSCA os dados existentes ao carregar a página
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
      } else {
        setUserUid(user.uid);

        try {
          // Busca os dados da empresa cadastrada no backend/Firestore
          const empresaSalva = await buscarEmpresa();
          if (empresaSalva) {
            setForm({
              razaoSocial: empresaSalva.razaoSocial || "",
              cnpj: empresaSalva.cnpj || "",
              porte: empresaSalva.porte || "",
              email: empresaSalva.email || "",
              phone: empresaSalva.phone || "",
              address: empresaSalva.address || "",
            });
          }
        } catch (error) {
          console.error("Erro ao carregar dados da empresa:", error);
        } finally {
          setCarregando(false);
        }
      }
    });
    return () => unsubscribe();
  }, [router]);

  function mudar(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === "cnpj" ? formatarCnpj(value) : value });
    setSalvo(false);
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErros([]);
    setSalvo(false);

    const problemas: string[] = [];
    if (form.razaoSocial.trim() === "") problemas.push("Informe a razão social.");
    if (form.cnpj.replace(/\D/g, "").length !== 14) problemas.push("O CNPJ precisa ter 14 números.");
    if (form.porte === "") problemas.push("Escolha o porte da empresa.");

    if (problemas.length > 0) {
      setErros(problemas);
      return;
    }

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        router.push("/login");
        return;
      }

      const token = await currentUser.getIdToken();
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

      const resposta = await fetch(`${API_URL}/editalcheckapp/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          userId: userUid,
        }),
      });

      if (!resposta.ok) {
        throw new Error("Erro ao salvar dados no servidor.");
      }

      setSalvo(true);
    } catch (error) {
      console.error(error);
      setErros(["Erro ao conectar com o servidor para salvar os dados."]);
    }
  }

  if (carregando) {
    return (
      <div className="flex h-48 items-center justify-center">
        <p className="text-sm text-blue-700">Carregando dados da empresa...</p>
      </div>
    );
  }

  const campo = "mt-1 w-full rounded border border-blue-300 bg-white px-3 py-2 text-sm";

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold">Empresa</h1>
      <p className="mb-6 text-blue-700">
        Os dados da empresa alimentam todas as análises de editais.
      </p>

      <form noValidate onSubmit={salvar} className="space-y-4 rounded border border-blue-200 bg-white p-5">
        <div>
          <label htmlFor="razaoSocial" className="text-sm font-semibold">Razão social *</label>
          <input id="razaoSocial" name="razaoSocial" value={form.razaoSocial} onChange={mudar} className={campo} />
        </div>

        <div>
          <label htmlFor="cnpj" className="text-sm font-semibold">CNPJ *</label>
          <input id="cnpj" name="cnpj" value={form.cnpj} onChange={mudar} placeholder="00.000.000/0000-00" className={campo} />
        </div>

        <div>
          <label htmlFor="porte" className="text-sm font-semibold">Porte *</label>
          <select id="porte" name="porte" value={form.porte} onChange={mudar} className={campo}>
            <option value="">Selecione...</option>
            <option value="MEI">MEI (microempreendedor individual)</option>
            <option value="ME">ME (microempresa)</option>
            <option value="EPP">EPP (empresa de pequeno porte)</option>
            <option value="OUTRO">Outro (médio ou grande porte)</option>
          </select>
          <p className="mt-1 text-xs text-blue-700">ME e EPP têm vantagens legais em algumas licitações.</p>
        </div>

        <div>
          <label htmlFor="email" className="text-sm font-semibold">E-mail</label>
          <input id="email" name="email" type="email" value={form.email} onChange={mudar} className={campo} />
        </div>

        <div>
          <label htmlFor="phone" className="text-sm font-semibold">Telefone</label>
          <input id="phone" name="phone" value={form.phone} onChange={mudar} className={campo} />
        </div>

        <div>
          <label htmlFor="address" className="text-sm font-semibold">Endereço</label>
          <input id="address" name="address" value={form.address} onChange={mudar} className={campo} />
        </div>

        {erros.length > 0 && (
          <ul className="list-disc rounded border border-red-300 bg-red-50 p-3 pl-8 text-sm text-red-700">
            {erros.map((erro) => (
              <li key={erro}>{erro}</li>
            ))}
          </ul>
        )}

        {salvo && (
          <p className="rounded border border-green-300 bg-green-50 p-3 text-sm font-semibold text-green-800">
            Dados salvos com sucesso no banco de dados!
          </p>
        )}

        <button type="submit" className="rounded bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">
          Salvar
        </button>
      </form>
    </div>
  );
}