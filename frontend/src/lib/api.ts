import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type Certidao = { tipo?: string; validade?: string; status?: string };
export type Empresa = { razaoSocial?: string; certidoes?: Certidao[] };

// Aguarda o Firebase carregar o usuário do cache do navegador
function esperarUsuarioLogado(): Promise<any> {
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

  try {
    const currentUser = await esperarUsuarioLogado();
    if (!currentUser) return null;

    const token = await currentUser.getIdToken();

    const controle = new AbortController();
    const timer = setTimeout(() => controle.abort(), 4000);

    const resposta = await fetch(`${API_URL}/editalcheckapp/consult`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      signal: controle.signal,
    });

    clearTimeout(timer);

    const tipo = resposta.headers.get("content-type") ?? "";
    if (!resposta.ok || !tipo.includes("application/json")) return null;

    const dados = await resposta.json();
    return (Array.isArray(dados) ? dados[0] : dados) ?? null;
  } catch (error) {
    console.error("Erro ao buscar empresa da API:", error);
    return null;
  }
}