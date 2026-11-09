"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const itens = [
  { href: "/habilitacao", nome: "Habilitação" },
  { href: "/empresa", nome: "Empresa" },
  { href: "/documentos", nome: "Documentos" },
  { href: "/atestados", nome: "Atestados" },
];

export default function Menu() {
  const pathname = usePathname();

  return (
    <nav aria-label="Navegação principal" className="flex flex-wrap gap-4 text-sm">
      {itens.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={pathname === item.href ? "page" : undefined}
          className={
            pathname === item.href
              ? "font-semibold underline underline-offset-4"
              : "hover:underline"
          }
        >
          {item.nome}
        </Link>
      ))}
    </nav>
  );
}
