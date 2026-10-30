"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../lib/firebase";

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
      //login real 
      await signInWithEmailAndPassword(auth, email, senha);

      //redireciona para a área interna do sistema
      router.push("/habilitacao");
    } catch (err: any) {
      console.error(err);
      setErro("E-mail ou senha incorretos.");
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
          <p role="alert" className="text-sm font-medium text-red-600">
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
    </main>
  );
}