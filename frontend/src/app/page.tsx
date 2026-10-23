import { redirect } from "next/navigation";

// Por enquanto a pagina inicial so leva para a Central de Habilitação
export default function Home() {
  redirect("/habilitacao");
}
