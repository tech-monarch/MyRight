import { Logo } from "@/components/Logo";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-surface-off">
      <header className="border-b border-border bg-white">
        <div className="container-page flex h-16 items-center">
          <Logo />
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">{children}</div>
      </main>
      <footer className="py-6 text-center text-xs text-text-muted">
        <Link href="/" className="hover:text-blue">
          &larr; Back to MyRight
        </Link>
      </footer>
    </div>
  );
}
