const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type Certidao = { tipo?: string; validade?: string; status?: string };
export type Empresa = { companyName?: string; certidoes?: Certidao[] };

// Devolve null quando o back não está configurado ou não responde.
export async function buscarEmpresa(): Promise<Empresa | null> {
  if (!API_URL) return null;

  const controle = new AbortController();
  const timer = setTimeout(() => controle.abort(), 4000);
  try {
    const resposta = await fetch(`${API_URL}/consult`, {
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
