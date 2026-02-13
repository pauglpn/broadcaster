import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Broadcaster",
  description:
    "Broadcaster vous aide à trouver où et quand regarder vos films et séries préférés en France : cinéma, TV, Netflix, Prime Video, Disney+ et plus.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
