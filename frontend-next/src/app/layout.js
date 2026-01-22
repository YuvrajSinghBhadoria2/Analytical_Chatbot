import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/Sidebar';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Analytical Chat',
  description: 'AI-powered analytical assistant',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar */}
          <div className="hidden md:flex flex-shrink-0 bg-black">
            <Sidebar />
          </div>

          {/* Main Content */}
          <main className="flex-1 relative h-full max-w-full overflow-hidden flex flex-col bg-[var(--background-start-rgb)]">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
