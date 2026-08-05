import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Programme d'opportunité KCS",
  description: "Programme privé d'opportunité académique pour les anciens élèves de Kinshasa Christian School."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
