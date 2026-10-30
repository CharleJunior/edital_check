"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Menu from "@/components/menu";
import { buscarEmpresa } from "@/lib/api";
import { auth } from "../../lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [nomeEmpresa, setNomeEmpresa] = useState("Carregando...");
  const [usuarioLogado, setUsuarioLogado] = useState(false);

  // monitoramento do estado da sessão do usuario
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUsuarioLogado(true);
        const empresa = await buscarEmpresa();
        setNomeEmpresa(
          empresa?.razaoSocial || "Empresa sem nome cadastrado"
        );
      } else {
        setUsuarioLogado(false);
        setNomeEmpresa("Modo de Teste / Deslogado");
      }
    });

    return () => unsubscribe();
  }, []);


  return (
    <div>
      <header className="bg-blue-700 text-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-6 px-4 py-4">
          <span className="text-xl font-bold">EditalCheck</span>
          <Menu />
          <div className="ml-auto flex items-center gap-4 text-sm">
            <span className="font-medium">{nomeEmpresa}</span>
            {usuarioLogado ? (
              <button
                onClick={() => signOut(auth)}
                className="underline hover:text-blue-200"
              >
                Sair
              </button>
            ) : (
              <Link href="/login" className="underline hover:text-blue-200">
                Entrar
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}