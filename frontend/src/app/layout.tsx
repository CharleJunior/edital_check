'use client';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

// Itens do menu. Para liberar uma tela nova:
// crie a página e mude "pronto" para true.
const itensMenu = [
  { href: "/habilitacao", nome: "Habilitação", pronto: true },
  { href: "/empresa", nome: "Empresa", pronto: true },
  { href: "/atestados", nome: "Atestados", pronto: false },
  { href: "/oportunidades", nome: "Oportunidades", pronto: false },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  // Endereço da tela aberta agora, para destacar o item certo do menu.
  const pathname = usePathname();

  const [nomeEmpresa, setNomeEmpresa] = useState("Carregando...");
  useEffect(() => {
    async function carregarEmpresa() {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        const response = await fetch(`${baseUrl}/consult`);
        const data = await response.json();
        const empresa = Array.isArray(data) ? data[0] : data;

        if (empresa && empresa.companyName) {
          setNomeEmpresa(empresa.companyName);
        } else {
          setNomeEmpresa("Empresa Não Identificada");
        }
      } catch (error) {
        console.error("Erro ao buscar dados da empresa:", error);
        setNomeEmpresa("Erro ao carregar");
      }
    }

    carregarEmpresa();
  }, []);
  return (
    <div>
      <header className="bg-blue-700 text-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-6 px-4 py-4">
          <span className="text-xl font-bold">EditalCheck</span>

          <nav className="flex gap-4 text-sm">
            {itensMenu.map((item) =>
              item.pronto ? (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    pathname === item.href
                      ? "font-semibold underline"
                      : "hover:underline"
                  }
                >
                  {item.nome}
                </Link>
              ) : (
                // Telas que estão pendentes
                <span key={item.href} className="text-blue-200">
                  {item.nome}
                </span>
              ),
            )}
          </nav>

          <span className="ml-auto text-sm">{nomeEmpresa}</span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
