"use client";

import { Toaster } from "sonner";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Toaster position="top-right" richColors closeButton />
      {children}
    </>
  );
}
