import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "SaaS Psicologia",
  description: "Plataforma completa para gestão de clínicas de psicologia",
};

import NextTopLoader from "nextjs-toploader";
import { Toaster } from "sonner";
import Providers from "@/components/Providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${poppins.variable} font-sans h-full antialiased`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <NextTopLoader color="#0d9488" showSpinner={false} shadow="0 0 10px #0d9488, 0 0 5px #0d9488" />
        <Toaster position="top-right" richColors closeButton />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}


