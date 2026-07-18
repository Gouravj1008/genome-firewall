import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { IBM_Plex_Sans, Space_Grotesk } from 'next/font/google';
import './globals.css';

const heading = Space_Grotesk({ subsets: ['latin'], variable: '--font-heading' });
const body = IBM_Plex_Sans({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-body' });

export const metadata: Metadata = {
  title: 'Genome Firewall AI',
  description: 'Production-quality clinical decision support demo for genome-based antibiotic resistance prediction.'
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={`${heading.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
