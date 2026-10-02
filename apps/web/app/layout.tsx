import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Spryxel — Platform foundation',
  description: 'A minimal accessible shell for the Spryxel platform foundation.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script id="spryxel-theme-bootstrap" src="/theme-bootstrap.js" />
      </head>
      <body>{children}</body>
    </html>
  );
}
