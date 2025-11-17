'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
  session: any;
}

export default function AppLayout({ children, session }: AppLayoutProps) {
  const pathname = usePathname();

  // For fill and embed pages, render without navbar/sidebar for embedding
  const isEmbedPage = pathname.includes('/fill') || pathname.includes('/embed');

  if (session && !isEmbedPage) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Navbar />
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-6">{children}</main>
        </div>
      </div>
    );
  }

  return <div className="min-h-screen">{children}</div>;
}
