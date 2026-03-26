import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const email = "psicogestao@admin.com";
    const password = "Intelbras-3246";
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.user.upsert({
      where: { email },
      update: {
        password: hashedPassword,
        role: "SUPER_ADMIN",
        emailVerified: new Date(),
      },
      create: {
        email,
        name: "Super Admin PsicoGestão",
        password: hashedPassword,
        role: "SUPER_ADMIN",
        emailVerified: new Date(),
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: "Conta Super Admin criada/atualizada com sucesso!",
      email: admin.email
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
