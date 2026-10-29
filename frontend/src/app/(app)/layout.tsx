"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Menu from "@/components/menu";
import { buscarEmpresa } from "@/lib/api";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [nomeEmpresa, setNomeEmpresa] = useState("Carregando...");

  useEffect(() => {
    buscarEmpresa().then((empresa) => {
      setNomeEmpresa(
        empresa
          ? empresa.companyName || "Empresa não identificada"
          : "Empresa Exemplo (teste)",
      );
    });
  }, []);

  return (
    <div>
      <header className="bg-blue-700 text-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-6 px-4 py-4">
          <span className="text-xl font-bold">EditalCheck</span>
          <Menu />
          <div className="ml-auto flex items-center gap-4 text-sm">
            <span>{nomeEmpresa}</span>
            <Link href="/login" className="underline hover:text-blue-200">
              Entrar
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
