import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BioInvest Skript-Training',
  description: 'Interaktives Lückentext-Training für Vertriebsmitarbeiter',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
