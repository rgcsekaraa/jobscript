import ThemeProvider from '../components/ThemeProvider';
import './globals.css';

import { ReactNode } from 'react';
import Sidebar from '@/components/Sidebar';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style>{`
          /* Hide content until theme is applied to prevent flash */
          body:not(.theme-loaded) {
            visibility: hidden;
          }
        `}</style>
      </head>
      <body>
        <ThemeProvider>
          <Sidebar />
          <main className="container mx-auto p-4">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
