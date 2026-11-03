"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../lib/firebase";

function traduzirErro(codigo: string) {
  switch (codigo) {
    case "auth/invalid-email":
      return "E-mail inválido.";
    case "auth/too-many-requests":
      return "Muitas tentativas. Aguarde um pouco e tente de novo.";
    case "auth/network-request-failed":
      return "Sem conexão com o servidor de login. Verifique a internet.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "E-mail ou senha incorretos.";
    default:
      return "Não foi possível entrar. Tente novamente.";
  }
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");

    if (!email.includes("@")) return setErro("Informe um e-mail válido.");
    if (!senha) return setErro("Informe a senha.");

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, senha);
      router.push("/habilitacao");
    } catch (err) {
      setErro(traduzirErro((err as { code?: string }).code ?? ""));
    } finally {
      setLoading(false);
    }
  }

  const campo =
    "w-full rounded border border-blue-300 bg-white px-3 py-2 outline-none focus:border-blue-700";

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-4 py-12">
      <h1 className="mb-1 text-2xl font-bold">EditalCheck</h1>
      <p className="mb-8 text-sm text-blue-700">Entre para acessar sua empresa.</p>

      <form onSubmit={entrar} noValidate className="space-y-4">
        <label className="block text-sm">
          E-mail
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className={campo}
          />
        </label>

        <label className="block text-sm">
          Senha
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            autoComplete="current-password"
            className={campo}
          />
        </label>

        {erro && (
          <p role="alert" className="text-sm font-medium text-blue-900">
            {erro}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-blue-700 py-2 font-medium text-white hover:bg-blue-800 disabled:opacity-50"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <Link href="/cadastro" className="mt-6 text-sm text-blue-700 underline">
        Criar conta
      </Link>
    </main>
  );
}
