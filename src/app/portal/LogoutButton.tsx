"use client";

import { LogOut } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";

export default function LogoutButton() {
  return (
    <button
      onClick={() => logoutAction()}
      className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-all active:scale-95 border border-rose-100"
    >
      <LogOut className="w-4 h-4" />
      Sair da Conta
    </button>
  );
}
