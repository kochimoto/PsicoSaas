"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { logoutAction } from "@/actions/auth";

interface LogoutButtonProps {
  className?: string;
  children?: React.ReactNode;
  title?: string;
  variant?: 'minimal' | 'full';
}

export default function LogoutButton({ className, children, title, variant = 'full' }: LogoutButtonProps) {
  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    try {
      // 1. Clear custom session (Server Action)
      await logoutAction();
    } catch (err) {
      console.error("Error clearing custom session:", err);
    }
    
    // 2. Clear NextAuth session and redirect
    await signOut({ callbackUrl: "/login" });
  };

  if (variant === 'minimal') {
    return (
      <button onClick={handleLogout} className={className} title={title}>
        {children || <LogOut className="w-5 h-5" />}
      </button>
    );
  }

  return (
    <button
      onClick={handleLogout}
      className={className || "flex items-center w-full px-4 py-3 rounded-xl font-medium text-red-600 hover:bg-red-50 transition-all font-bold"}
      title={title}
    >
      {children || (
        <>
          <LogOut className="mr-3 h-5 w-5 text-red-500" />
          Sair da Conta
        </>
      )}
    </button>
  );
}
