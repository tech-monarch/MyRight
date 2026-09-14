import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MyRight: Resolve disputes without going to court",
  description:
    "MyRight helps you understand your dispute, explore mediation and other resolution options, and take the next step, guided by AI and backed by real ADR professionals.",
};

// Without this, mobile browsers assume a desktop-width virtual viewport
// (roughly 980px) and scale the whole rendered page down to fit the
// screen, rather than actually laying it out at the phone's real width.
// Every responsive class (sm:, md:, lg:) evaluates against that fake
// 980px width too, so mobile-specific styles never engage at all, cards
// end up desktop-sized and just visually shrunk, exactly the symptom
// reported here.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
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
