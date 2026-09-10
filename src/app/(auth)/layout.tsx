import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/shared/auth/session";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (await getCurrentUser()) redirect("/dashboard");
  return (
    <main className="shell">
      <header className="masthead">
        <Link className="brand" href="/">
          предмет<span> / studio</span>
        </Link>
      </header>
      <section className="auth-panel">{children}</section>
    </main>
  );
}
