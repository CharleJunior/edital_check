import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");

export type Certidao = {
  tipo?: string;
  validade?: string;
  status?: string;
};

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

/** Retorna o nome em qualquer um dos formatos já utilizados pelo projeto. */
export function nomeDaEmpresa(empresa: Empresa | null): string {
  return empresa?.razaoSocial || empresa?.companyName || "";
}

/** Aguarda o Firebase restaurar a sessão salva no navegador. */
function esperarUsuarioLogado(): Promise<User | null> {
  return new Promise((resolve) => {
    if (auth.currentUser) {
      resolve(auth.currentUser);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

/** Consulta a empresa do usuário na API atualmente configurada. */
export async function buscarEmpresa(): Promise<Empresa | null> {
  if (!API_URL) {
    console.error("NEXT_PUBLIC_API_URL não foi configurada.");
    return null;
  }

  let timer: ReturnType<typeof setTimeout> | undefined;

  try {
    const usuario = await esperarUsuarioLogado();
    if (!usuario) return null;

    const token = await usuario.getIdToken();
    const controle = new AbortController();
    timer = setTimeout(() => controle.abort(), 8000);

    const resposta = await fetch(`${API_URL}/editalcheckapp/consult`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      signal: controle.signal,
    });

    if (!resposta.ok) {
      console.error(`A API respondeu com HTTP ${resposta.status} ao consultar a empresa.`);
      return null;
    }

    const contentType = resposta.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      console.error("A API retornou uma resposta que não é JSON.");
      return null;
    }

    const dados: unknown = await resposta.json();
    const empresa = Array.isArray(dados) ? dados[0] : dados;
    return (empresa && typeof empresa === "object" ? empresa : null) as Empresa | null;
  } catch (error) {
    console.error("Não foi possível consultar a empresa na API:", error);
    return null;
  } finally {
    if (timer) clearTimeout(timer);
  }
}
