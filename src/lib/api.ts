import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type Certidao = { tipo?: string; validade?: string; status?: string };
export type Empresa = {
  razaoSocial?: string;
  companyName?: string;
  cnpj?: string;
  porte?: string;
  email?: string;
  phone?: string;
  address?: string;
  certidoes?: Certidao[];
};

export function nomeDaEmpresa(empresa: Empresa | null): string {
  return empresa?.razaoSocial || empresa?.companyName || "";
}

// Aguarda o Firebase carregar o usuário do cache do navegador
function esperarUsuarioLogado(): Promise<User | null> {
  return new Promise((resolve) => {
    if (auth.currentUser) return resolve(auth.currentUser);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

export async function buscarEmpresa(): Promise<Empresa | null> {
  if (!API_URL) return null;

  const controle = new AbortController();
  const timer = setTimeout(() => controle.abort(), 4000);
  try {
    const usuario = await esperarUsuarioLogado();
    if (!usuario) return null;

    const token = await usuario.getIdToken();
    const resposta = await fetch(`${API_URL}/editalcheckapp/consult`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      signal: controle.signal,
    });

    const tipo = resposta.headers.get("content-type") ?? "";
    if (!resposta.ok || !tipo.includes("application/json")) return null;

    const dados = await resposta.json();
    return (Array.isArray(dados) ? dados[0] : dados) ?? null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
