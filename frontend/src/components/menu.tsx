"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Para liberar uma tela no menu: crie a página e mude "pronto" para true.
const itens = [
  { href: "/habilitacao", nome: "Habilitação", pronto: true },
  { href: "/empresa", nome: "Empresa", pronto: true },
  { href: "/atestados", nome: "Atestados", pronto: false },
  { href: "/oportunidades", nome: "Oportunidades", pronto: false },
];

export default function Menu() {
  // Endereço da tela aberta agora, para destacar o item do menu.
  const pathname = usePathname();

  return (
    <nav className="flex gap-4 text-sm">
      {itens.map((item) =>
        item.pronto ? (
          <Link
            key={item.href}
            href={item.href}
            className={pathname === item.href ? "font-semibold underline" : "hover:underline"}
          >
            {item.nome}
          </Link>
        ) : (
          <span key={item.href} className="text-blue-200">
            {item.nome}
          </span>
        ),
      )}
    </nav>
  );
}
