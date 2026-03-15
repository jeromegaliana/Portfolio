import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ClassicParts AI — Trouvez les pièces pour votre voiture ancienne",
  description: "Agent IA pour passionnés de voitures anciennes : fiches techniques, sources de pièces détachées et liens vers clubs & forums.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
