"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

function traduzirErro(codigo: string) {
  switch (codigo) {
    case "auth/email-already-in-use":
      return "Já existe uma conta com esse e-mail.";
    case "auth/invalid-email":
      return "E-mail inválido.";
    case "auth/weak-password":
      return "Senha fraca: use pelo menos 6 caracteres.";
    case "auth/network-request-failed":
      return "Sem conexão com o servidor. Verifique a internet.";
    default:
      return "Não foi possível criar a conta. Tente novamente.";
  }
}

export default function CadastroPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function criarConta(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    if (!email.includes("@")) return setErro("Informe um e-mail válido.");
    if (senha.length < 6) return setErro("A senha precisa ter pelo menos 6 caracteres.");
    if (senha !== confirmar) return setErro("As senhas não são iguais.");

    setEnviando(true);
    try {
      await createUserWithEmailAndPassword(auth, email, senha);
      router.replace("/empresa");
    } catch (err) {
      setErro(traduzirErro((err as { code?: string }).code ?? ""));
      setEnviando(false);
    }
  }

  const campo =
    "w-full rounded border border-blue-300 bg-white px-3 py-2 outline-none focus:border-blue-700";

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-4 py-12">
      <h1 className="mb-1 text-2xl font-bold">Criar conta</h1>
      <p className="mb-8 text-sm text-blue-700">
        Depois de criar a conta, você cadastra os dados da sua empresa.
      </p>

      <form onSubmit={criarConta} noValidate className="space-y-4">
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
            autoComplete="new-password"
            className={campo}
          />
        </label>

        <label className="block text-sm">
          Confirmar senha
          <input
            type="password"
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
            autoComplete="new-password"
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
          disabled={enviando}
          className="w-full rounded bg-blue-700 py-2 font-medium text-white hover:bg-blue-800 disabled:opacity-60"
        >
          {enviando ? "Criando..." : "Criar conta"}
        </button>
      </form>

      <Link href="/login" className="mt-6 text-sm text-blue-700 underline">
        Já tenho conta
      </Link>
    </main>
  );
}
