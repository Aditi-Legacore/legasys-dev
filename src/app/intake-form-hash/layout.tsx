"use client";

import { Providers } from "../../components/ThemeProvider";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <div className="min-h-screen bg-white">{children}</div>
    </Providers>
  );
}
