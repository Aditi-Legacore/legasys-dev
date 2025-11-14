"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

interface LayoutContentProps {
  session: unknown;
  children: React.ReactNode;
}

export default function LayoutContent({ session, children }: LayoutContentProps) {
  const pathname = usePathname();
  const isIntakeFormHash = pathname?.startsWith("/intake-form-hash");

  // For intake-form-hash, always show without sidebar/navbar regardless of session
  if (isIntakeFormHash) {
    return <div className="min-h-screen">{children}</div>;
  }

  // For other pages, show sidebar/navbar only if session exists
  if (session) {
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
