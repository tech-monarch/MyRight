import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MyRight: Resolve disputes without going to court",
  description:
    "MyRight helps you understand your dispute, explore mediation and other resolution options, and take the next step, guided by AI and backed by real ADR professionals.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
