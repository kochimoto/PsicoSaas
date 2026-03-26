"use client";

import { Toaster } from "sonner";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* We can keep Toaster here if we want, but removed ThemeProvider */}
      {children}
    </>
  );
}
