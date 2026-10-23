import Link from "next/link";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <header className="bg-blue-700 text-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-6 px-4 py-4">
          <span className="text-xl font-bold">EditalCheck</span>

          <nav className="flex gap-4 text-sm">
            <Link href="/habilitacao" className="font-semibold underline">
              Habilitação
            </Link>
            {/* Telas que estão pendentes */}
            <span className="text-blue-200">Empresa</span>
            <span className="text-blue-200">Atestados</span>
            <span className="text-blue-200">Oportunidades</span>
          </nav>

          <span className="ml-auto text-sm">Empresa Exemplo Ltda</span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
